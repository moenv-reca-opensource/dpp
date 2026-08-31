(() => {
  'use strict'

  const API_BASE_URL = document.querySelector('meta[name="dpp-api-base"]')?.content || '/api'
  const ASSET_BASE_URL = document.querySelector('meta[name="dpp-asset-base"]')?.content || '/'
  const REQUEST_TIMEOUT_MS = 30_000
  const LOCAL_PREVIEW_DPP_ID = '010000000000000010DEMO-BATCH-00121DEMO-SERIAL-001'
  const NO_DATA_IMAGES = ['images/nodata-1.png', 'images/nodata-2.png', 'images/nodata-3.png']

  const COUNTRY_LABELS = { TW: '台灣', US: '美國' }
  const CERTIFICATE_LABELS = {
    1: 'SCS 標準',
    2: 'GRS 標準',
    3: 'RCS 標準',
    4: 'CFV 盤查認證',
    5: 'CE 標誌'
  }
  const MATERIAL_LABELS = {
    1: '材料組成成分',
    2: '關鍵材料組成成分',
    3: '有害成分',
    4: '回收材料成分',
    5: '使用的可再生材料',
    6: '產品內關注物質'
  }
  const REPAIR_TYPE_LABELS = { 1: '維修', 2: '更換' }
  const RECYCLE_TYPE_LABELS = { 1: '回收', 2: '報廢' }
  const RECYCLE_ADDRESS_LABELS = { 1: '使用公司地址', 2: '自行填入' }
  const SPECIFICATION_LABELS = {
    Battery1: '預期使用壽命（年）',
    Battery2: '電動車製造商',
    Battery3: '電動車組裝國',
    Battery4: '電池生產商',
    Battery5: '電池生產國',
    Battery6: '電芯生產商',
    Battery7: '電芯生產國',
    Battery8: '電池類型',
    Battery9: '額定容量（Ah）',
    Battery10: '電芯型態',
    Battery11: '每個電池的電池芯數',
    Battery12: '電池總能量（kWh）',
    Battery13: '電池往返能源效率（%）',
    Battery14: '電池重量（kg）',
    Battery15: '電池不使用時的可承受溫度（°C）',
    Battery16: '電池充放電率（C）',
    Battery17: '註冊商號',
    Battery18: '註冊商標',
    Battery19: '產品電子郵件信箱',
    Battery20: '電池的化學成分、CAS 號碼與重量',
    Battery21: '可用滅火劑',
    Battery22: '生命週期階段區分的電池碳足跡',
    Battery23: '碳足跡性能等級',
    Battery24: '碳足跡值估算依據連結',
    Battery25: '最低、標稱及最高電壓與溫度範圍',
    Battery26: '電池功率能力與溫度範圍',
    Battery27: '預估電池壽命（循環）',
    Battery28: '預估電池壽命參考測試方式',
    Battery29: '耗盡的容量閾值',
    Battery30: '初始電池單元電阻',
    Battery31: '初始電池組電阻',
    Battery32: '初始能源往返效率',
    Battery33: '循環壽命 50% 的能源往返效率',
    Battery34: '電池法規測試報告結果',
    Battery35: '電池種類',
    Battery36: '歐盟符合性聲明 ID',
    Battery37: '電池製造或投入使用日期',
    Battery38: '最大電池功率能力',
    Battery39: '初始自放電率與溫度範圍',
    Battery40: '電池生命週期每 kWh 二氧化碳排放量'
  }

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
    if (Array.isArray(value)) return value.filter(isPresent).join('、') || fallback
    return String(value)
  }

  const formatDate = (value) => {
    if (!isPresent(value)) return 'N/A'
    const matched = String(value).match(/^\d{4}-\d{2}-\d{2}/)
    return matched ? matched[0] : String(value)
  }

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
        throw new Error(data?.s_message || `API 回應錯誤（${response.status}）`)
      }

      const payload = Object.prototype.hasOwnProperty.call(data, 'payload') ? data.payload : data
      if (!payload || typeof payload !== 'object') throw new Error('API 未回傳有效的護照資料')
      return payload
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('讀取逾時，請確認網路連線後再試')
      throw error
    } finally {
      window.clearTimeout(timeout)
    }
  }

  const getMockPassport = (id) => window.DPP_MOCK_PASSPORTS?.[id] || null

  const renderHero = ({ record, dpp, product, operator }) => {
    const title = displayValue(product.ProdName, '電池數位產品護照')

    document.title = `${title}｜電池數位產品護照`
    elements.title.textContent = title
    elements.dataSourceLabel.textContent = record.__isMock
      ? '本頁使用內建示範資料，不會呼叫 API'
      : '資料由公開護照 API 即時提供'
    elements.carbonValue.textContent = displayValue(product.CFPValue, '—')
    elements.carbonUnit.textContent = displayValue(product.CFPEmissionUnit, '—')
    elements.carbonDate.textContent = formatDate(product.CFPDate)
    elements.carbonFunctionUnit.textContent = displayValue(product.CFPFunctionUnit, '—')
    updateShareLinks(title)
  }

  const updateShareLinks = (productTitle) => {
    const shareTitle = `${productTitle}｜電池數位產品護照`
    const shareUrl = window.location.href
    const encodedTitle = encodeURIComponent(shareTitle)
    const encodedUrl = encodeURIComponent(shareUrl)
    const emailBody = encodeURIComponent(`${shareTitle}\n${shareUrl}`)

    elements.emailShare.href = `mailto:?subject=${encodedTitle}&body=${emailBody}`
    elements.facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    elements.lineShare.href = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
  }

  const renderOverview = ({ record, dpp, dppInfo, product, operator }) => {
    appendDefinitionItems(elements.basicInfo, [
      { label: '產品序號', value: dpp.SerialNo },
      { label: '廠商名稱', value: operator.CompName || record.EORIID || dpp.EORIID },
      { label: '護照開始日', value: formatDate(dpp.PassportStartDate) },
      { label: '產品型號', value: product.Model },
      { label: '產品製造日', value: formatDate(dpp.MftDate) },
      { label: '產品類別', value: '電池' },
      { label: '產品保固日', value: formatDate(dpp.WarrantyDate) }
    ])

    appendDefinitionItems(elements.identityInfo, [
      { label: '全球交易品項識別碼', value: dppInfo.GTIN, mono: true },
      { label: '運送容序號', value: dppInfo.SSCC, mono: true },
      { label: '批號', value: dppInfo.BatchLot, mono: true },
      { label: '交易品項原產國', value: COUNTRY_LABELS[dppInfo.OrigIn] || dppInfo.OrigIn },
      { label: '唯一識別碼（DUNS）', value: dppInfo.UniqueFacilityIdentifierDUNS, mono: true },
      { label: '唯一識別碼（GLN）', value: dppInfo.UniqueFacilityIdentifierGLN, mono: true },
      { label: '工廠登記號碼', value: product.FID, mono: true },
      { label: '稅則稅號分類', value: product.CCCCode || dppInfo.CCCCode, mono: true },
      { label: 'TARIC 編碼', value: dppInfo.TARIC, mono: true }
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
      attributes: { src: imageUrl, alt: `${displayValue(product.ProdName, '電池產品')}示意圖` }
    })
    image.addEventListener('error', () => image.remove(), { once: true })
    elements.productVisual.prepend(image)
    const fallback = elements.productVisual.querySelector('.battery-illustration')
    image.addEventListener('load', () => fallback?.remove(), { once: true })
  }

  const renderMaterials = ({ materials }) => {
    elements.materialPanel.replaceChildren(createPanelHeading('材料資訊', 'MATERIAL COMPOSITION'))
    if (!materials.length) {
      elements.materialPanel.append(createEmptyState('此護照目前沒有材料組成資料。'))
      return
    }

    const materialSections = []
    materials.forEach((group, groupIndex) => {
      const materialType = String(group.MaterType || groupIndex + 1)
      const section = createSubsection(MATERIAL_LABELS[group.MaterType] || `材料類別 ${materialType}`)
      section.dataset.materialType = materialType
      if (isPresent(group.Description || group.description)) {
        section.append(element('p', { className: 'notice', text: group.Description || group.description }))
      }
      const items = [group.Material, group.material].find(Array.isArray) || []
      const grid = element('div', { className: 'record-grid material-grid' })

      items.forEach((item) => {
        const card = element('article', { className: 'record-card material-card' })
        appendRecordDefinition(card, [
          { label: '材料名稱', value: item.composition },
          {
            label: '重量',
            value: [
              [item.weight, item.unit].filter(isPresent).join(' '),
              isPresent(item.error_value) ? `誤差 ${item.error_value}` : ''
            ]
              .filter(isPresent)
              .join('，')
          },
          { label: '部件', value: item.parts },
          { label: '消費後回收時間', value: item.consumer_time },
          { label: 'CAS 號碼', value: item.cas_no },
          { label: 'CLP 索引編號', value: item.clp_index_no },
          { label: '危害分類代碼', value: item.hazard_class_and_category_code },
          { label: '濃度範圍', value: item.concentration_range },
          { label: '原產國', value: COUNTRY_LABELS[item.origin_country] || item.origin_country },
          { label: '供應商', value: item.supplier }
        ])
        grid.append(card)
      })

      section.append(items.length ? grid : createEmptyState('此材料類別尚未提供明細。'))
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
    fieldset.append(element('legend', { className: 'sr-only', text: '篩選顯示的材料類別' }))

    const allInput = element('input', {
      attributes: { id: 'material-filter-all', type: 'checkbox' }
    })
    const allLabel = element('label', {
      className: 'material-filter__all',
      attributes: { for: 'material-filter-all' }
    })
    allLabel.append(allInput, element('span', { text: '全選／全部取消勾選' }))

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
        element('span', { text: MATERIAL_LABELS[group.MaterType] || `材料類別 ${materialType}` })
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
        elements.pageStatus.textContent = `材料篩選已更新，目前顯示 ${visibleCount} 個類別。`
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
      createPanelHeading('電池特定資訊', 'BATTERY SPECIFICATION')
    )
    if (!specifications.length) {
      elements.specificationPanel.append(createEmptyState('此護照目前沒有電池特定資訊。'))
      return
    }

    const list = element('div', { className: 'specification-list' })
    specifications.forEach((specification, index) => {
      const item = element('section', { className: 'specification-item' })
      const code = displayValue(specification.SpecInfo_Type, 'Battery')
      const title = SPECIFICATION_LABELS[code] || code
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
        content.append(element('p', { text: '此項目尚未提供明細。' }))
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
      if (detailList.length > 1) card.append(element('h5', { text: `資料組 ${index + 1}` }))
      appendRecordDefinition(card, [
        { label: '數值', value: [displayValue(detail.value, ''), detail.unit].filter(isPresent).join(' ') },
        { label: '說明', value: detail.description },
        { label: '溫度範圍', value: formatTemperature(detail.Temperature) }
      ])
    })
  }

  const renderVoltageDetails = (card, voltages) => {
    const voltageList = Array.isArray(voltages) ? voltages : isPresent(voltages) ? [voltages] : []
    voltageList.forEach((voltage, index) => {
      if (!voltage || typeof voltage !== 'object') return
      card.append(element('h5', { text: `電壓資料${voltageList.length > 1 ? ` ${index + 1}` : ''}` }))
      appendRecordDefinition(card, [
        {
          label: '最低／標稱／最高',
          value: [voltage.min, voltage.nom, voltage.max].map((value) => displayValue(value)).join(' / ')
        },
        { label: '單位', value: voltage.unit },
        { label: '說明', value: voltage.description },
        { label: '溫度範圍', value: formatTemperature(voltage.Temperature) }
      ])
    })
  }

  const renderChemistryDetails = (card, chemistry) => {
    if (!chemistry || typeof chemistry !== 'object' || Array.isArray(chemistry)) return
    const groups = [
      ['正極材料', chemistry.positive_electrode],
      ['負極材料', chemistry.negative_electrode],
      ['電解質', chemistry.electrolyte]
    ]
    const hasGroups = groups.some(([, items]) => Array.isArray(items) && items.length)
    if (!hasGroups && !isPresent(chemistry.description)) return

    card.append(element('h5', { text: '化學成分' }))
    groups.forEach(([label, items]) => {
      if (!Array.isArray(items)) return
      items.forEach((item) => {
        appendRecordDefinition(card, [
          {
            label,
            value: [item.name, item.cas_no && `CAS ${item.cas_no}`, item.weight, chemistry.unit]
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
      ['強制性認證', mandatoryCertifications],
      ['自願性認證', voluntaryCertifications]
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
            text: CERTIFICATE_LABELS[certification.CertName] || displayValue(certification.CertName, '未命名認證')
          })
        )
        appendRecordDefinition(card, [
          { label: '證書序號', value: certification.CertificateNo },
          { label: '驗證機構', value: certification.CertificationBody },
          { label: '證書開始日期', value: formatDate(certification.StartDate) },
          { label: '證書結束日期', value: formatDate(certification.EndDate) }
        ])
        appendSafeLink(card, certification.CertLink, '開啟證書連結')
        if (Number(certification.CertName) === 5) {
          card.append(
            element('img', {
              className: 'certification-mark',
              attributes: { src: 'images/CEMark.png', alt: 'CE 標誌' }
            })
          )
        }
        grid.append(card)
      })
      section.append(grid)
      elements.verificationContent.append(section)
    })

    if (!certificationCount) {
      elements.verificationContent.append(createEmptyState('此護照目前沒有標準查證資料。'))
    }
  }

  const renderLifecycle = ({ repairRecords, recycleRecords }) => {
    elements.repairPanel.replaceChildren(createPanelHeading('維修紀錄', 'REPAIR RECORD'))
    elements.recyclePanel.replaceChildren(createPanelHeading('回收紀錄', 'RECYCLE RECORD'))

    if (repairRecords.length) renderRepairRecords(repairRecords, elements.repairPanel)
    else elements.repairPanel.append(createEmptyState('此護照目前沒有維修紀錄。'))

    if (recycleRecords.length) renderRecycleRecords(recycleRecords, elements.recyclePanel)
    else elements.recyclePanel.append(createEmptyState('此護照目前沒有回收紀錄。'))

  }

  const renderPefRecords = (records, container) => {
    if (!records.length) return
    const section = createSubsection('產品環境足跡')
    const grid = element('div', { className: 'record-grid' })
    records.forEach((record, index) => {
      const card = element('article', { className: 'record-card' })
      card.append(
        element('h5', { className: 'record-card__title', text: `環境足跡紀錄 ${index + 1}` })
      )
      appendRecordDefinition(card, [
        { label: '評估日期', value: formatDate(record.AssessmentDate) },
        { label: '衝擊類別', value: record.ImpactCategory },
        { label: '生命週期階段', value: record.LifeCycleStage },
        { label: '特徵化結果', value: [record.CharacterizationResult, record.Unit].filter(isPresent).join(' ') },
        { label: '正規化結果', value: record.NormalizationResult },
        { label: '加權結果', value: record.WeightingResult },
        { label: '說明', value: record.Description }
      ])
      grid.append(card)
    })
    section.append(grid)
    container.append(section)
  }

  const renderRepairRecords = (records, container) => {
    if (!records.length) return
    const section = createSubsection('維修紀錄')
    const grid = element('div', { className: 'record-grid' })
    records.forEach((record, index) => {
      const card = element('article', { className: 'record-card record-card--wide' })
      card.append(element('h5', { className: 'record-card__title', text: `維修紀錄 ${index + 1}` }))
      appendRecordDefinition(card, [
        { label: '送修日期', value: formatDate(record.repair_date) },
        { label: '交付日期', value: formatDate(record.repair_delivery_date) }
      ])
      const details = Array.isArray(record.repair_info)
        ? record.repair_info
        : typeof record.repair_info === 'object' && record.repair_info
          ? [record.repair_info]
          : []
      details.forEach((detail, detailIndex) => {
        card.append(element('h6', { text: `維修項目 ${detailIndex + 1}` }))
        appendRecordDefinition(card, [
          { label: '處理類型', value: REPAIR_TYPE_LABELS[detail.repair_type] || detail.repair_type },
          { label: '元件名稱', value: detail.component_name },
          { label: '執行日期', value: formatDate(detail.action_date) },
          { label: '執行地點', value: detail.action_area },
          { label: '說明', value: detail.description }
        ])
      })
      grid.append(card)
    })
    section.append(grid)
    container.append(section)
  }

  const renderRecycleRecords = (records, container) => {
    if (!records.length) return
    const section = createSubsection('回收紀錄')
    const grid = element('div', { className: 'record-grid' })
    records.forEach((record, index) => {
      const card = element('article', { className: 'record-card' })
      card.append(element('h5', { className: 'record-card__title', text: `回收紀錄 ${index + 1}` }))
      appendRecordDefinition(card, [
        { label: '回收日期', value: formatDate(record.recycle_date) },
        { label: '產品狀態', value: RECYCLE_TYPE_LABELS[record.recycle_type] || record.recycle_type },
        {
          label: '貯存地區類別',
          value: RECYCLE_ADDRESS_LABELS[record.recycle_addr_type] || record.recycle_addr_type
        },
        { label: '貯存地址', value: record.recycle_addr },
        { label: '處理情形', value: record.execution_dec },
        { label: '完成日期', value: formatDate(record.completed_date) }
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
      return source.map((url, index) => ({ label: `產品連結 ${index + 1}`, url }))
    }
    if (!source || typeof source !== 'object') return []
    const labels = {
      ProdWebPageLink: '產品網頁',
      ProductManualLink: '產品使用手冊',
      MaintenanceManualLink: '產品維修手冊'
    }
    return Object.entries(source).map(([key, url]) => ({ label: labels[key] || key, url }))
  }

  const renderLinks = ({ product, trademarks, pefRecords }) => {
    elements.linksPanel.replaceChildren(createPanelHeading('說明與連結', 'DESCRIPTION & REFERENCE'))
    elements.trademarkPanel.replaceChildren(createPanelHeading('商標', 'TRADEMARK'))
    const productLinks = getProductLinks(product.ProdInfoLink).filter(({ url }) => resolveUrl(url))
    const hasDescription = isPresent(product.Description)

    if (hasDescription || productLinks.length) {
      const section = createSubsection('產品說明與連結')
      if (hasDescription) section.append(element('p', { className: 'notice', text: product.Description }))
      const grid = element('div', { className: 'record-grid' })
      productLinks.forEach(({ label, url }) => {
        const card = element('article', { className: 'record-card' })
        card.append(element('h5', { className: 'record-card__title', text: label }))
        appendSafeLink(card, url, '在新分頁開啟')
        grid.append(card)
      })
      if (productLinks.length) section.append(grid)
      elements.linksPanel.append(section)
    }

    renderPefRecords(pefRecords, elements.linksPanel)
    if (!hasDescription && !productLinks.length && !pefRecords.length) {
      elements.linksPanel.append(createEmptyState('此護照目前沒有產品說明或外部連結。'))
    }

    if (trademarks.length) {
      const section = createSubsection('商標資訊')
      const grid = element('div', { className: 'record-grid' })
      trademarks.forEach((trademark) => {
        const card = element('article', { className: 'record-card' })
        card.append(
          element('h5', {
            className: 'record-card__title',
            text: displayValue(trademark.TrademarkName, '商標')
          })
        )
        appendRecordDefinition(card, [
          { label: '申請案號', value: trademark.ApplicationNumber },
          { label: '商標局', value: trademark.TrademarkOffice },
          { label: '有效期間', value: `${formatDate(trademark.StartDate)} – ${formatDate(trademark.EndDate)}` },
          {
            label: '國家／地區',
            value: COUNTRY_LABELS[trademark.CountryCode || trademark.country_code_id] ||
              trademark.CountryCode ||
              trademark.country_code_id
          },
          { label: '行政區', value: trademark.Subdivision }
        ])
        appendSafeLink(card, trademark.TradeMarkLink, '開啟商標資料')
        grid.append(card)
      })
      section.append(grid)
      elements.trademarkPanel.append(section)
    } else {
      elements.trademarkPanel.append(createEmptyState('此護照目前沒有商標資料。'))
    }
  }

  const renderPassport = (payload) => {
    const passport = normalizedPassport(payload)

    if (Number(passport.dpp.DPPClass) !== 1) {
      throw new Error('API 回傳的護照不是電池類別，無法使用此頁面顯示。')
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
    elements.pageStatus.textContent = '正在讀取電池護照資料。'
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
    elements.pageStatus.textContent = '電池護照資料載入完成。'
  }

  const setErrorState = (message) => {
    elements.loading.hidden = true
    elements.loading.setAttribute('aria-busy', 'false')
    elements.content.hidden = true
    elements.errorMessage.textContent = displayValue(message, '請確認網址或稍後再試。')
    elements.error.hidden = false
    elements.retryButton.disabled = false
    elements.pageStatus.textContent = '電池護照資料載入失敗。'
  }

  const loadPassport = async () => {
    const id = getRouteId()
    if (!id) {
      setErrorState('網址格式不正確。請使用 /01/{GTIN}/10/{BatchLot}/21/{SerialNo} 開啟本頁。')
      return
    }

    setLoadingState()
    try {
      const payload = getMockPassport(id) || (await getPassport(id))
      renderPassport(payload)
      setSuccessState()
    } catch (error) {
      console.error('[frontstage/dpp.info]', error)
      setErrorState(error instanceof Error ? error.message : '讀取護照資料時發生錯誤。')
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
