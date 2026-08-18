<?php

namespace App\Enum;

// PEF衝擊指標參數值,code 對應資料庫/前端傳入的 impactCategory 代碼
enum ImpactCategory: int
{
    case ClimateChange = 1;
    case OzoneDepletion = 2;
    case EcotoxicityFreshwater = 3;
    case HumanToxicityCancer = 4;
    case HumanToxicityNonCancer = 5;
    case ParticulateMatter = 6;
    case IonisingRadiationHumanHealth = 7;
    case PhotochemicalOzoneFormation = 8;
    case Acidification = 9;
    case EutrophicationTerrestrial = 10;
    case EutrophicationFreshwater = 11;
    case EutrophicationMarine = 12;
    case WaterUse = 13;
    case ResourceUseMineralsMetals = 14;
    case ResourceUseFossil = 15;
    case LandUse = 16;

    public function labelZh(): string
    {
        return match ($this) {
            self::ClimateChange => '溫室效應',
            self::OzoneDepletion => '臭氧層破壞',
            self::EcotoxicityFreshwater => '對淡水生態毒性',
            self::HumanToxicityCancer => '人類毒性-癌症',
            self::HumanToxicityNonCancer => '人類毒性-非癌症',
            self::ParticulateMatter => '顆粒物質',
            self::IonisingRadiationHumanHealth => '電離輻射-人體健康影響',
            self::PhotochemicalOzoneFormation => '光化學臭氧形成',
            self::Acidification => '酸化',
            self::EutrophicationTerrestrial => '優養化-陸地',
            self::EutrophicationFreshwater => '優養化-淡水',
            self::EutrophicationMarine => '優養化-海水',
            self::WaterUse => '資源耗竭-水',
            self::ResourceUseMineralsMetals => '資源耗竭-礦物與金屬',
            self::ResourceUseFossil => '資源耗竭-化石燃料',
            self::LandUse => '土地使用',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::ClimateChange => 'Climate change(kg CO2 eq)',
            self::OzoneDepletion => 'Ozone Depletion(kg CFC-11 eq)',
            self::EcotoxicityFreshwater => 'Ecotoxicity freshwater(CTUe)',
            self::HumanToxicityCancer => 'Human Toxicity, cancer(CTUh)',
            self::HumanToxicityNonCancer => 'Human Toxicity, non-cancer(CTUh)',
            self::ParticulateMatter => 'Particulate matter(Disease incidences)',
            self::IonisingRadiationHumanHealth => 'Ionising radiation , human health(kBq U235 eq)',
            self::PhotochemicalOzoneFormation => 'Photochemical ozone formation, human health(kg NMVOC eq)',
            self::Acidification => 'Acidification(mol H+ eq)',
            self::EutrophicationTerrestrial => 'Eutrophication, terrestrial(mol N eq)',
            self::EutrophicationFreshwater => 'Eutrophication, freshwater(kg P eq)',
            self::EutrophicationMarine => 'Eutrophication, marine(kg N eq)',
            self::WaterUse => 'Water use(m3 world eq. deprived water)',
            self::ResourceUseMineralsMetals => 'Resource Use, minerals and metals(kg Sb eq)',
            self::ResourceUseFossil => 'Resource use, fossil(MJ)',
            self::LandUse => 'Land use(Dimensionless (pt))',
        };
    }
}
