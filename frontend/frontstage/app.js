(() => {
  'use strict'

  const API_BASE_URL = document.querySelector('meta[name="dpp-api-base"]')?.content || '/api'
  const ASSET_BASE_URL = document.querySelector('meta[name="dpp-asset-base"]')?.content || '/'
  const REQUEST_TIMEOUT_MS = 30_000
  const LOCAL_PREVIEW_DPP_ID = '010000000000000010DEMO-BATCH-00121DEMO-SERIAL-001'
  const NO_DATA_IMAGES = ['images/nodata-1.png', 'images/nodata-2.png', 'images/nodata-3.png']
  const i18n = window.DPP_I18N
  const t = i18n.t

  const localizedLookup = (group, value, fallback = value) => {
    if (!isPresent(value)) return fallback
    const key = `${group}.${value}`
    const translated = t(key)
    return translated === key ? fallback : translated
  }

  const label = (key) => t(`labels.${key}`)

  const elements = {
    pageStatus: document.querySelector('#page-status'),
    loading: document.querySelector('#loading-state'),
    error: document.querySelector('#error-state'),
    errorMessage: document.querySelector('#error-message'),
    retryButton: document.querySelector('#retry-button'),
    content: document.querySelector('#passport-content'),
    title: document.querySelector('#passport-title'),
    carbonValue: document.querySelector('#carbon-value'),
    carbonUnit: document.querySelector('#carbon-unit'),
    carbonDate: document.querySelector('#carbon-date'),
    carbonFunctionUnit: document.querySelector('#carbon-function-unit'),
    carbonButton: document.querySelector('#carbon-button'),
    carbonDialog: document.querySelector('#carbon-dialog'),
    carbonDialogClose: document.querySelector('#carbon-dialog-close'),
    basicInfo: document.querySelector('#basic-info'),
    identityInfo: document.querySelector('#identity-info'),
    productVisual: document.querySelector('#product-visual'),
    dataSourceLabel: document.querySelector('#data-source-label'),
    printButton: document.querySelector('#print-button'),
    emailShare: document.querySelector('#email-share'),
    facebookShare: document.querySelector('#facebook-share'),
    lineShare: document.querySelector('#line-share'),
    tabs: Array.from(document.querySelectorAll('[role="tab"]')),
    panels: Array.from(document.querySelectorAll('[role="tabpanel"]')),
    materialPanel: document.querySelector('#panel-material'),
    specificationPanel: document.querySelector('#panel-specification'),
    verificationContent: document.querySelector('#verification-content'),
    trademarkPanel: document.querySelector('#panel-trademark'),
    linksPanel: document.querySelector('#panel-links'),
    repairPanel: document.querySelector('#panel-repair'),
    recyclePanel: document.querySelector('#panel-recycle')
  }

  const element = (tagName, options = {}) => {
    const node = document.createElement(tagName)
    if (options.className) node.className = options.className
    if (options.text !== undefined) node.textContent = String(options.text)
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([name, value]) => {
        if (value !== undefined && value !== null) node.setAttribute(name, String(value))
      })
    }
    return node
  }

  const isPresent = (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  const displayValue = (value, fallback = 'N/A') => {
    if (!isPresent(value)) return fallback
    if (Array.isArray(value)) return value.filter(isPresent).join(i18n.listSeparator) || fallback
    return String(value)
  }

  const formatDate = (value) => i18n.formatDate(value)

  const resolveUrl = (value, baseUrl = window.location.href) => {
    if (!isPresent(value)) return null
    try {
      const url = new URL(String(value), new URL(baseUrl, window.location.href))
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null
    } catch {
      return null
    }
  }

  const appendDefinitionItems = (container, items) => {
    const fragment = document.createDocumentFragment()
    items.forEach(({ label, value, mono = false }) => {
      const wrapper = element('div', { className: `data-item${mono ? ' data-item--mono' : ''}` })
      wrapper.append(element('dt', { text: label }), element('dd', { text: displayValue(value) }))
      fragment.append(wrapper)
    })
    container.replaceChildren(fragment)
  }

  const appendRecordDefinition = (container, items) => {
    const list = element('dl')
    items.filter(({ value }) => isPresent(value)).forEach(({ label, value }) => {
      list.append(element('dt', { text: label }), element('dd', { text: displayValue(value) }))
    })
    container.append(list)
  }

  const createPanelHeading = (title, code) => {
    const heading = element('div', { className: 'panel-heading' })
    heading.append(element('h3', { text: title }), element('p', { text: code }))
    return heading
  }

  const createEmptyState = (message) => {
    const state = element('div', { className: 'empty-state' })
    const imagePath = NO_DATA_IMAGES[Math.floor(Math.random() * NO_DATA_IMAGES.length)]
    state.append(
      element('img', { attributes: { src: imagePath, alt: '' } }),
      element('p', { text: message })
    )
    return state
  }

  const createSubsection = (title) => {
    const section = element('section', { className: 'subsection' })
    section.append(element('h4', { className: 'subsection-title', text: title }))
    return section
  }

  const normalizedPassport = (record) => {
    const dppSource = Array.isArray(record.DPP) ? record.DPP[0] : record.DPP
    const dpp = dppSource && typeof dppSource === 'object' ? dppSource : record

    return {
      record,
      dpp,
      dppInfo: record.DPPInfo || {},
      product: record.ProductInfo || {},
      operator: record.EORI || {},
      mandatoryCertifications: Array.isArray(record.MandatoryCertification)
        ? record.MandatoryCertification.filter(Boolean)
        : [],
      voluntaryCertifications: Array.isArray(record.VoluntaryCertification)
        ? record.VoluntaryCertification.filter(Boolean)
        : [],
      materials: Array.isArray(record.Material) ? record.Material.filter(Boolean) : [],
      specifications: Array.isArray(record.ProductInfo?.SpecInfo)
        ? record.ProductInfo.SpecInfo.filter(Boolean)
        : [],
      trademarks: Array.isArray(record.TradeMark) ? record.TradeMark.filter(Boolean) : [],
      pefRecords: Array.isArray(record.PEFInfo) ? record.PEFInfo.filter(Boolean) : [],
      repairRecords: [record.RepairRecord, record.product_repair].find(Array.isArray) || [],
      recycleRecords: [record.RecycleRecord, record.product_recycle].find(Array.isArray) || []
    }
  }

  const decodePathSegment = (segment) => {
    try {
      return decodeURIComponent(segment)
    } catch {
      return segment
    }
  }

  const getRouteId = () => {
    const currentUrl = new URL(window.location.href)
    if (currentUrl.protocol === 'file:') return LOCAL_PREVIEW_DPP_ID

    const routeMatch = currentUrl.pathname.match(/^\/01\/([^/]+)\/10\/([^/]+)\/21\/([^/]+)\/?$/)
    if (!routeMatch) return ''

    const [, rawGtin, rawBatchLot, rawSerialNo] = routeMatch
    const gtin = decodePathSegment(rawGtin)
    const batchLot = decodePathSegment(rawBatchLot)
    const serialNo = decodePathSegment(rawSerialNo)

    return `01${gtin}10${batchLot}21${serialNo}`
  }

  const getApiUrl = () => {
    const base = new URL(API_BASE_URL.replace(/\/?$/, '/'), window.location.href)
    return new URL('frontstage/dpp.info', base).href
  }

  const getPassport = async (id) => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, DPPID: id }),
        signal: controller.signal
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data || data.success === false) {
        const error = new Error(t('apiResponseError', { status: response.status }))
        error.details = data?.s_message
        throw error
      }

      const payload = Object.prototype.hasOwnProperty.call(data, 'payload') ? data.payload : data
      if (!payload || typeof payload !== 'object') throw new Error(t('invalidApiResponse'))
      return payload
    } catch (error) {
      if (error.name === 'AbortError') throw new Error(t('timeoutError'))
      throw error
    } finally {
      window.clearTimeout(timeout)
    }
  }

  const getMockPassport = (id) => window.DPP_MOCK_PASSPORTS?.[id] || null

  const renderHero = ({ record, dpp, product, operator }) => {
    const title = displayValue(product.ProdName, t('productPassportFallback'))

    document.title = `${title} | ${t('pageTitle')}`
    elements.title.textContent = title
    elements.dataSourceLabel.textContent = record.__isMock
      ? t('dataSourceMock')
      : t('dataSourceApi')
    elements.carbonValue.textContent = displayValue(product.CFPValue, '—')
    elements.carbonUnit.textContent = displayValue(product.CFPEmissionUnit, '—')
    elements.carbonDate.textContent = formatDate(product.CFPDate)
    elements.carbonFunctionUnit.textContent = displayValue(product.CFPFunctionUnit, '—')
    updateShareLinks(title)
  }

  const updateShareLinks = (productTitle) => {
    const shareTitle = `${productTitle} | ${t('pageTitle')}`
    const emailSubject = t('emailSubject', { title: productTitle })
    const shareUrl = window.location.href
    const encodedUrl = encodeURIComponent(shareUrl)
    const emailBody = encodeURIComponent(`${shareTitle}\n${shareUrl}`)

    elements.emailShare.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`
    elements.facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    elements.lineShare.href = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
  }

  const renderOverview = ({ record, dpp, dppInfo, product, operator }) => {
    appendDefinitionItems(elements.basicInfo, [
      { label: label('productSerialNumber'), value: dpp.SerialNo },
      { label: label('manufacturer'), value: operator.CompName || record.EORIID || dpp.EORIID },
      { label: label('passportStartDate'), value: formatDate(dpp.PassportStartDate) },
      { label: label('productModel'), value: product.Model },
      { label: label('productManufactureDate'), value: formatDate(dpp.MftDate) },
      { label: label('productCategory'), value: t('battery') },
      { label: label('warrantyDate'), value: formatDate(dpp.WarrantyDate) }
    ])

    appendDefinitionItems(elements.identityInfo, [
      { label: label('gtin'), value: dppInfo.GTIN, mono: true },
      { label: label('sscc'), value: dppInfo.SSCC, mono: true },
      { label: label('batchLot'), value: dppInfo.BatchLot, mono: true },
      { label: label('productOriginCountry'), value: localizedLookup('country', dppInfo.OrigIn) },
      { label: label('duns'), value: dppInfo.UniqueFacilityIdentifierDUNS, mono: true },
      { label: label('gln'), value: dppInfo.UniqueFacilityIdentifierGLN, mono: true },
      { label: label('facilityRegistrationNumber'), value: product.FID, mono: true },
      { label: label('tariffClassification'), value: product.CCCCode || dppInfo.CCCCode, mono: true },
      { label: label('taric'), value: dppInfo.TARIC, mono: true }
    ])

    renderProductVisual(product)
  }

  const collectProductImages = (source) => {
    const values = Array.isArray(source)
      ? source
      : source && typeof source === 'object'
        ? Object.values(source)
        : [source]

    return values
      .filter(isPresent)
      .map((value) => resolveUrl(value, ASSET_BASE_URL))
      .filter(Boolean)
  }

  const renderProductVisual = (product) => {
    const imageUrl = collectProductImages(product.ProdPhoto)[0]
    if (!imageUrl) return

    const image = element('img', {
      attributes: { src: imageUrl, alt: `${displayValue(product.ProdName, t('batteryProduct'))} ${t('productImageAlt')}` }
    })
    image.addEventListener('error', () => image.remove(), { once: true })
    elements.productVisual.prepend(image)
    const fallback = elements.productVisual.querySelector('.battery-illustration')
    image.addEventListener('load', () => fallback?.remove(), { once: true })
  }

  const renderMaterials = ({ materials }) => {
    elements.materialPanel.replaceChildren(createPanelHeading(t('materialInfo'), 'MATERIAL COMPOSITION'))
    if (!materials.length) {
      elements.materialPanel.append(createEmptyState(t('noMaterialData')))
      return
    }

    const materialSections = []
    materials.forEach((group, groupIndex) => {
      const materialType = String(group.MaterType || groupIndex + 1)
      const section = createSubsection(
        localizedLookup('material', group.MaterType, t('materialType', { type: materialType }))
      )
      section.dataset.materialType = materialType
      if (isPresent(group.Description || group.description)) {
        section.append(element('p', { className: 'notice', text: group.Description || group.description }))
      }
      const items = [group.Material, group.material].find(Array.isArray) || []
      const grid = element('div', { className: 'record-grid material-grid' })

      items.forEach((item) => {
        const card = element('article', { className: 'record-card material-card' })
        appendRecordDefinition(card, [
          { label: label('materialName'), value: item.composition },
          {
            label: label('weight'),
            value: [
              [item.weight, item.unit].filter(isPresent).join(' '),
              isPresent(item.error_value) ? `${t('labels.error')} ${item.error_value}` : ''
            ]
              .filter(isPresent)
              .join(i18n.valueSeparator)
          },
          { label: label('parts'), value: item.parts },
          { label: label('postConsumerRecyclingTime'), value: item.consumer_time },
          { label: label('casNumber'), value: item.cas_no },
          { label: label('clpIndexNumber'), value: item.clp_index_no },
          { label: label('hazardClassificationCode'), value: item.hazard_class_and_category_code },
          { label: label('concentrationRange'), value: item.concentration_range },
          { label: label('originCountry'), value: localizedLookup('country', item.origin_country) },
          { label: label('supplier'), value: item.supplier }
        ])
        grid.append(card)
      })

      section.append(items.length ? grid : createEmptyState(t('noMaterialDetails')))
      materialSections.push(section)
      elements.materialPanel.append(section)
    })

    elements.materialPanel.insertBefore(
      createMaterialFilter(materials, materialSections),
      materialSections[0]
    )
  }

  const createMaterialFilter = (materials, materialSections) => {
    const fieldset = element('fieldset', { className: 'material-filter' })
    fieldset.append(element('legend', { className: 'sr-only', text: t('materialFilterLegend') }))

    const allInput = element('input', {
      attributes: { id: 'material-filter-all', type: 'checkbox' }
    })
    const allLabel = element('label', {
      className: 'material-filter__all',
      attributes: { for: 'material-filter-all' }
    })
    allLabel.append(allInput, element('span', { text: t('selectAllMaterials') }))

    const optionList = element('div', { className: 'material-filter__options' })
    const typeInputs = materials.map((group, index) => {
      const materialType = String(group.MaterType || index + 1)
      const inputId = `material-filter-${materialType}`
      const input = element('input', {
        attributes: { id: inputId, type: 'checkbox', value: materialType }
      })
      const label = element('label', { attributes: { for: inputId } })
      label.append(
        input,
        element('span', {
          text: localizedLookup('material', group.MaterType, t('materialType', { type: materialType }))
        })
      )
      optionList.append(label)
      return input
    })

    const updateMaterialVisibility = (announce = false) => {
      const selectedTypes = new Set(typeInputs.filter((input) => input.checked).map((input) => input.value))
      const showAll = selectedTypes.size === 0
      materialSections.forEach((section) => {
        section.hidden = !showAll && !selectedTypes.has(section.dataset.materialType)
      })
      allInput.checked = selectedTypes.size === typeInputs.length
      allInput.indeterminate = selectedTypes.size > 0 && selectedTypes.size < typeInputs.length
      if (announce) {
        const visibleCount = showAll ? materialSections.length : selectedTypes.size
        elements.pageStatus.textContent = t('materialFilterUpdated', { count: visibleCount })
      }
    }

    allInput.addEventListener('change', () => {
      typeInputs.forEach((input) => {
        input.checked = allInput.checked
      })
      updateMaterialVisibility(true)
    })
    typeInputs.forEach((input) => input.addEventListener('change', () => updateMaterialVisibility(true)))

    fieldset.append(allLabel, optionList)
    return fieldset
  }

  const renderSpecifications = ({ specifications }) => {
    elements.specificationPanel.replaceChildren(
      createPanelHeading(t('specificInfo'), 'BATTERY SPECIFICATION')
    )
    if (!specifications.length) {
      elements.specificationPanel.append(createEmptyState(t('noSpecificationData')))
      return
    }

    const list = element('div', { className: 'specification-list' })
    specifications.forEach((specification, index) => {
      const item = element('section', { className: 'specification-item' })
      const code = displayValue(specification.SpecInfo_Type, 'Battery')
      const title = localizedLookup('specification', code, code)
      const buttonId = `specification-toggle-${index + 1}`
      const contentId = `specification-content-${index + 1}`
      const heading = element('h4', { className: 'specification-item__heading' })
      const toggle = element('button', {
        className: 'specification-toggle',
        attributes: {
          id: buttonId,
          type: 'button',
          'aria-expanded': 'false',
          'aria-controls': contentId
        }
      })
      const icon = element('span', {
        className: 'specification-toggle__icon',
        text: '＋',
        attributes: { 'aria-hidden': 'true' }
      })
      toggle.append(element('span', { text: title }), icon)
      heading.append(toggle)

      const content = element('div', {
        className: 'specification-content',
        attributes: { id: contentId, 'aria-labelledby': buttonId }
      })
      content.hidden = true

      renderSpecificationDetails(content, specification.Details)
      renderVoltageDetails(content, specification.Voltage)
      renderChemistryDetails(content, specification.Chemistry)

      if (!content.querySelector('dl') && !content.querySelector('h5')) {
        content.append(element('p', { text: t('noItemDetails') }))
      }

      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true'
        toggle.setAttribute('aria-expanded', String(!expanded))
        content.hidden = expanded
        icon.textContent = expanded ? '＋' : '−'
      })

      item.append(heading, content)
      list.append(item)
    })
    elements.specificationPanel.append(list)
  }

  const renderSpecificationDetails = (card, details) => {
    const detailList = Array.isArray(details) ? details : isPresent(details) ? [details] : []
    detailList.forEach((detail, index) => {
      if (!detail || typeof detail !== 'object') return
      if (detailList.length > 1) card.append(element('h5', { text: t('dataGroup', { index: index + 1 }) }))
      appendRecordDefinition(card, [
        { label: label('value'), value: [displayValue(detail.value, ''), detail.unit].filter(isPresent).join(' ') },
        { label: label('description'), value: detail.description },
        { label: label('temperatureRange'), value: formatTemperature(detail.Temperature) }
      ])
    })
  }

  const renderVoltageDetails = (card, voltages) => {
    const voltageList = Array.isArray(voltages) ? voltages : isPresent(voltages) ? [voltages] : []
    voltageList.forEach((voltage, index) => {
      if (!voltage || typeof voltage !== 'object') return
      card.append(
        element('h5', {
          text: voltageList.length > 1 ? t('voltageDataNumber', { index: index + 1 }) : t('voltageData')
        })
      )
      appendRecordDefinition(card, [
        {
          label: label('minNomMax'),
          value: [voltage.min, voltage.nom, voltage.max].map((value) => displayValue(value)).join(' / ')
        },
        { label: label('unit'), value: voltage.unit },
        { label: label('description'), value: voltage.description },
        { label: label('temperatureRange'), value: formatTemperature(voltage.Temperature) }
      ])
    })
  }

  const renderChemistryDetails = (card, chemistry) => {
    if (!chemistry || typeof chemistry !== 'object' || Array.isArray(chemistry)) return
    const groups = [
      [t('cathode'), chemistry.positive_electrode],
      [t('anode'), chemistry.negative_electrode],
      [t('electrolyte'), chemistry.electrolyte]
    ]
    const hasGroups = groups.some(([, items]) => Array.isArray(items) && items.length)
    if (!hasGroups && !isPresent(chemistry.description)) return

    card.append(element('h5', { text: t('chemicalComposition') }))
    groups.forEach(([label, items]) => {
      if (!Array.isArray(items)) return
      items.forEach((item) => {
        appendRecordDefinition(card, [
          {
            label,
            value: [item.name, item.cas_no && `${t('casPrefix')} ${item.cas_no}`, item.weight, chemistry.unit]
              .filter(isPresent)
              .join(' · ')
          }
        ])
      })
    })
    if (isPresent(chemistry.description)) card.append(element('p', { text: chemistry.description }))
  }

  const formatTemperature = (temperature) => {
    if (!temperature || typeof temperature !== 'object' || Array.isArray(temperature)) return 'N/A'
    const range = [temperature.min, temperature.max].filter(isPresent).join(' – ')
    return [range, temperature.unit, temperature.description].filter(isPresent).join(' · ') || 'N/A'
  }

  const renderVerifications = ({ mandatoryCertifications, voluntaryCertifications }) => {
    elements.verificationContent.replaceChildren()
    const certificationGroups = [
      [t('mandatoryCertification'), mandatoryCertifications],
      [t('voluntaryCertification'), voluntaryCertifications]
    ]
    let certificationCount = 0

    certificationGroups.forEach(([title, certifications]) => {
      const validCertifications = certifications.filter((certification) =>
        Object.values(certification || {}).some(isPresent)
      )
      if (!validCertifications.length) return
      certificationCount += validCertifications.length
      const section = element('section', { className: 'subsection certification-group' })
      section.append(element('h3', { className: 'subsection-title', text: title }))
      const grid = element('div', { className: 'record-grid' })

      validCertifications.forEach((certification) => {
        const card = element('article', { className: 'record-card certification-card' })
        card.append(
          element('h4', {
            className: 'record-card__title',
            text: localizedLookup('certificate', certification.CertName, displayValue(certification.CertName, t('unnamedCertification')))
          })
        )
        appendRecordDefinition(card, [
          { label: label('certificateNumber'), value: certification.CertificateNo },
          { label: label('certificationBody'), value: certification.CertificationBody },
          { label: label('certificateStartDate'), value: formatDate(certification.StartDate) },
          { label: label('certificateEndDate'), value: formatDate(certification.EndDate) }
        ])
        appendSafeLink(card, certification.CertLink, t('openCertificate'))
        if (Number(certification.CertName) === 5) {
          card.append(
            element('img', {
              className: 'certification-mark',
              attributes: { src: 'images/CEMark.png', alt: t('ceCertificationAlt') }
            })
          )
        }
        grid.append(card)
      })
      section.append(grid)
      elements.verificationContent.append(section)
    })

    if (!certificationCount) {
      elements.verificationContent.append(createEmptyState(t('noVerificationData')))
    }
  }

  const renderLifecycle = ({ repairRecords, recycleRecords }) => {
    elements.repairPanel.replaceChildren(createPanelHeading(t('repairRecords'), 'REPAIR RECORD'))
    elements.recyclePanel.replaceChildren(createPanelHeading(t('recycleRecords'), 'RECYCLE RECORD'))

    if (repairRecords.length) renderRepairRecords(repairRecords, elements.repairPanel)
    else elements.repairPanel.append(createEmptyState(t('noRepairData')))

    if (recycleRecords.length) renderRecycleRecords(recycleRecords, elements.recyclePanel)
    else elements.recyclePanel.append(createEmptyState(t('noRecycleData')))

  }

  const renderPefRecords = (records, container) => {
    if (!records.length) return
    const section = createSubsection(t('productEnvironmentalFootprint'))
    const grid = element('div', { className: 'record-grid' })
    records.forEach((record, index) => {
      const card = element('article', { className: 'record-card' })
      card.append(
          element('h5', {
            className: 'record-card__title',
            text: t('environmentalFootprintRecord', { index: index + 1 })
          })
      )
      appendRecordDefinition(card, [
        { label: label('assessmentDate'), value: formatDate(record.AssessmentDate) },
        { label: label('impactCategory'), value: record.ImpactCategory },
        { label: label('lifeCycleStage'), value: record.LifeCycleStage },
        { label: label('characterizationResult'), value: [record.CharacterizationResult, record.Unit].filter(isPresent).join(' ') },
        { label: label('normalizationResult'), value: record.NormalizationResult },
        { label: label('weightingResult'), value: record.WeightingResult },
        { label: label('description'), value: record.Description }
      ])
      grid.append(card)
    })
    section.append(grid)
    container.append(section)
  }

  const renderRepairRecords = (records, container) => {
    if (!records.length) return
    const section = createSubsection(t('repairRecords'))
    const grid = element('div', { className: 'record-grid' })
    records.forEach((record, index) => {
      const card = element('article', { className: 'record-card record-card--wide' })
      card.append(
        element('h5', {
          className: 'record-card__title',
          text: t('repairRecord', { number: index + 1 })
        })
      )
      appendRecordDefinition(card, [
        { label: label('repairDate'), value: formatDate(record.repair_date) },
        { label: label('deliveryDate'), value: formatDate(record.repair_delivery_date) }
      ])
      const details = Array.isArray(record.repair_info)
        ? record.repair_info
        : typeof record.repair_info === 'object' && record.repair_info
          ? [record.repair_info]
          : []
      details.forEach((detail, detailIndex) => {
        card.append(element('h6', { text: t('repairItem', { number: detailIndex + 1 }) }))
        appendRecordDefinition(card, [
          { label: label('repairType'), value: localizedLookup('repairType', detail.repair_type, detail.repair_type) },
          { label: label('componentName'), value: detail.component_name },
          { label: label('actionDate'), value: formatDate(detail.action_date) },
          { label: label('actionArea'), value: detail.action_area },
          { label: label('description'), value: detail.description }
        ])
      })
      grid.append(card)
    })
    section.append(grid)
    container.append(section)
  }

  const renderRecycleRecords = (records, container) => {
    if (!records.length) return
    const section = createSubsection(t('recycleRecords'))
    const grid = element('div', { className: 'record-grid' })
    records.forEach((record, index) => {
      const card = element('article', { className: 'record-card' })
      card.append(
        element('h5', {
          className: 'record-card__title',
          text: t('recycleRecord', { number: index + 1 })
        })
      )
      appendRecordDefinition(card, [
        { label: label('recycleDate'), value: formatDate(record.recycle_date) },
        { label: label('productStatus'), value: localizedLookup('recycleType', record.recycle_type, record.recycle_type) },
        {
          label: label('storageAddressType'),
          value: localizedLookup('recycleAddressType', record.recycle_addr_type, record.recycle_addr_type)
        },
        { label: label('storageAddress'), value: record.recycle_addr },
        { label: label('handling'), value: record.execution_dec },
        { label: label('completedDate'), value: formatDate(record.completed_date) }
      ])
      grid.append(card)
    })
    section.append(grid)
    container.append(section)
  }

  const appendSafeLink = (container, urlValue, label) => {
    const safeUrl = resolveUrl(urlValue)
    if (!safeUrl) return
    const link = element('a', {
      text: label,
      attributes: { href: safeUrl, target: '_blank', rel: 'noopener noreferrer' }
    })
    container.append(link)
  }

  const getProductLinks = (source) => {
    if (Array.isArray(source)) {
      return source.map((url, index) => ({ label: t('productLinkNumber', { index: index + 1 }), url }))
    }
    if (!source || typeof source !== 'object') return []
    return Object.entries(source).map(([key, url]) => ({ label: localizedLookup('productLink', key, key), url }))
  }

  const renderLinks = ({ product, trademarks, pefRecords }) => {
    elements.linksPanel.replaceChildren(createPanelHeading(t('descriptionAndLinks'), 'DESCRIPTION & REFERENCE'))
    elements.trademarkPanel.replaceChildren(createPanelHeading(t('trademark'), 'TRADEMARK'))
    const productLinks = getProductLinks(product.ProdInfoLink).filter(({ url }) => resolveUrl(url))
    const hasDescription = isPresent(product.Description)

    if (hasDescription || productLinks.length) {
      const section = createSubsection(t('productDescriptionAndLinks'))
      if (hasDescription) section.append(element('p', { className: 'notice', text: product.Description }))
      const grid = element('div', { className: 'record-grid' })
      productLinks.forEach(({ label, url }) => {
        const card = element('article', { className: 'record-card' })
        card.append(element('h5', { className: 'record-card__title', text: label }))
        appendSafeLink(card, url, t('openInNewTab'))
        grid.append(card)
      })
      if (productLinks.length) section.append(grid)
      elements.linksPanel.append(section)
    }

    renderPefRecords(pefRecords, elements.linksPanel)
    if (!hasDescription && !productLinks.length && !pefRecords.length) {
      elements.linksPanel.append(createEmptyState(t('noDescriptionOrLinks')))
    }

    if (trademarks.length) {
      const section = createSubsection(t('trademarkInfo'))
      const grid = element('div', { className: 'record-grid' })
      trademarks.forEach((trademark) => {
        const card = element('article', { className: 'record-card' })
        card.append(
          element('h5', {
            className: 'record-card__title',
            text: displayValue(trademark.TrademarkName, t('trademarkFallback'))
          })
        )
        appendRecordDefinition(card, [
          { label: label('trademarkApplicationNumber'), value: trademark.ApplicationNumber },
          { label: label('trademarkOffice'), value: trademark.TrademarkOffice },
          { label: label('validityPeriod'), value: `${formatDate(trademark.StartDate)} – ${formatDate(trademark.EndDate)}` },
          {
            label: label('countryRegion'),
            value: localizedLookup(
              'country',
              trademark.CountryCode || trademark.country_code_id,
              trademark.CountryCode || trademark.country_code_id
            )
          },
          { label: label('subdivision'), value: trademark.Subdivision }
        ])
        appendSafeLink(card, trademark.TradeMarkLink, t('openTrademark'))
        grid.append(card)
      })
      section.append(grid)
      elements.trademarkPanel.append(section)
    } else {
      elements.trademarkPanel.append(createEmptyState(t('noTrademarkData')))
    }
  }

  const renderPassport = (payload) => {
    const passport = normalizedPassport(payload)

    if (Number(passport.dpp.DPPClass) !== 1) {
      throw new Error(t('invalidPassportType'))
    }

    renderHero(passport)
    renderOverview(passport)
    renderMaterials(passport)
    renderSpecifications(passport)
    renderVerifications(passport)
    renderLifecycle(passport)
    renderLinks(passport)
  }

  const setLoadingState = () => {
    elements.pageStatus.textContent = t('pageStatusLoading')
    elements.loading.hidden = false
    elements.loading.setAttribute('aria-busy', 'true')
    elements.error.hidden = true
    elements.content.hidden = true
    elements.retryButton.disabled = true
  }

  const setSuccessState = () => {
    elements.loading.hidden = true
    elements.loading.setAttribute('aria-busy', 'false')
    elements.error.hidden = true
    elements.content.hidden = false
    elements.retryButton.disabled = false
    elements.pageStatus.textContent = t('pageStatusSuccess')
  }

  const setErrorState = (message) => {
    elements.loading.hidden = true
    elements.loading.setAttribute('aria-busy', 'false')
    elements.content.hidden = true
    elements.errorMessage.textContent = displayValue(message, t('errorDefault'))
    elements.error.hidden = false
    elements.retryButton.disabled = false
    elements.pageStatus.textContent = t('pageStatusError')
  }

  const loadPassport = async () => {
    const id = getRouteId()
    if (!id) {
      setErrorState(t('invalidRoute'))
      return
    }

    setLoadingState()
    try {
      const payload = getMockPassport(id) || (await getPassport(id))
      renderPassport(payload)
      setSuccessState()
    } catch (error) {
      console.error('[frontstage/dpp.info]', error)
      setErrorState(error instanceof Error ? error.message : t('loadError'))
    }
  }

  const activateTab = (tab, moveFocus = false) => {
    const panelId = tab.getAttribute('aria-controls')
    elements.tabs.forEach((candidate) => {
      const isActive = candidate === tab
      candidate.setAttribute('aria-selected', String(isActive))
      candidate.setAttribute('tabindex', isActive ? '0' : '-1')
    })
    elements.panels.forEach((panel) => {
      panel.hidden = panel.id !== panelId
    })
    if (moveFocus) tab.focus()
  }

  const setupTabs = () => {
    elements.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab))
      tab.addEventListener('keydown', (event) => {
        const keyOffsets = { ArrowLeft: -1, ArrowRight: 1 }
        if (event.key in keyOffsets) {
          event.preventDefault()
          const nextIndex = (index + keyOffsets[event.key] + elements.tabs.length) % elements.tabs.length
          activateTab(elements.tabs[nextIndex], true)
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault()
          activateTab(event.key === 'Home' ? elements.tabs[0] : elements.tabs.at(-1), true)
        }
      })
    })
  }

  const setupCarbonDialog = () => {
    elements.carbonButton.addEventListener('click', () => {
      elements.carbonDialog.showModal()
      elements.carbonDialogClose.focus()
    })
    elements.carbonDialogClose.addEventListener('click', () => elements.carbonDialog.close())
    elements.carbonDialog.addEventListener('close', () => elements.carbonButton.focus())
  }

  elements.retryButton.addEventListener('click', loadPassport)
  elements.printButton.addEventListener('click', () => window.print())
  setupTabs()
  setupCarbonDialog()
  loadPassport()
})()
