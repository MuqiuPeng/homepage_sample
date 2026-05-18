/**
 * One-shot data normalizer for series + variant descriptions.
 *
 * Why a separate script (vs. hand-edited JSON):
 * - 55 series + 130 variants × 2 languages = ~370 strings; bundling them in one
 *   reviewable map is easier to audit than diffing a 5 000-line JSON.
 * - Re-runnable: if we want to retune the wording, rerun with a tweaked map.
 * - Validates shape: catches typos / missing IDs before they hit prod.
 *
 * Usage:
 *   pnpm tsx scripts/normalize-descriptions.ts
 *
 * Behavior:
 * - Reads data/products.json, replaces `description` on every series and
 *   listed variant with the values below, writes back in-place.
 * - Variants not listed in VARIANT_DESCRIPTIONS keep their existing
 *   description (so previously-written variant text isn't clobbered when
 *   we're filling in blanks).
 * - Series IDs / variant IDs that don't exist in the JSON cause a hard error
 *   (so map drift surfaces immediately).
 */

import fs from "node:fs";
import path from "node:path";

type I18n = { zh: string; en: string };

const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "data", "products.json");

// -----------------------------------------------------------------------------
// Series descriptions — 2 sentences each. Sentence 1: positioning (what +
// key spec). Sentence 2: processing + use.
// -----------------------------------------------------------------------------
const SERIES_DESCRIPTIONS: Record<string, I18n> = {
  // ===== fluororesin =====
  "jf-series": {
    zh: "三氟氯乙烯（CTFE）与乙烯基酯共聚溶剂型氟碳树脂，固含量 ≥50%、氟含量 25±1%。适用于双组分常温固化氟碳涂料，用于钢结构、桥梁、化工设备及户外高耐候装饰。",
    en: "CTFE / vinyl-ester copolymer solvent-based fluorocarbon resin, solid content ≥50%, fluorine content 25±1%. Formulated into two-component ambient-cure fluorocarbon coatings for steel structures, bridges, chemical equipment and outdoor weather-resistant decoration.",
  },
  "zhm-2-series": {
    zh: "中昊 ZHM-2 系列溶剂型氟碳树脂，固含量 60±2%、氟含量 27±1%。适用于双组分氟碳涂料，用于钢结构、太阳能背板、沿海/海洋设施及化工设备防腐。",
    en: "Zhonghao ZHM-2 series solvent-based fluorocarbon resin, solid content 60±2%, fluorine content 27±1%. Used in two-component fluorocarbon coatings for steel structures, solar backsheets, coastal / marine facilities and chemical-equipment anti-corrosion.",
  },
  "zhm-5-series": {
    zh: "中昊 ZHM-5 系列高分子量溶剂型氟碳树脂，专为卷材涂料配方设计。适用于双组分氟碳卷材涂料，用于铝型材、铝幕墙与卷材涂装。",
    en: "Zhonghao ZHM-5 series high-molecular-weight solvent-based fluorocarbon resin tuned for coil-coating formulations. Used in two-component fluorocarbon coil coatings for aluminum profiles, aluminum curtain walls and coil-coating lines.",
  },
  "zhm-modified-series": {
    zh: "中昊 ZHM 改性系列溶剂型氟碳树脂，对透明 PET 薄膜及 EVA / 硅胶具有优异粘结性。适用于双组分氟碳涂料，用于太阳能光伏背板涂层、海洋防腐、大型钢构与卷材涂装。",
    en: "Zhonghao ZHM modified-series solvent-based fluorocarbon resin with strong adhesion to transparent PET film and compatibility with EVA / silicone. Used in two-component fluorocarbon coatings for PV solar backsheets, marine anti-corrosion, large steel structures and coil coating.",
  },
  "zht-series": {
    zh: "中昊基于四氟乙烯（TFE）开发的新一代溶剂型氟碳树脂，固含量 65±2%、氟含量 27±2%。适用于双组分氟碳涂料，用于钢结构、太阳能背板、沿海设施及化工设备防腐。",
    en: "Zhonghao's next-generation TFE-based solvent fluorocarbon resin, solid content 65±2%, fluorine content 27±2%. Used in two-component fluorocarbon coatings for steel structures, solar backsheets, coastal facilities and chemical-equipment anti-corrosion.",
  },

  // ===== fluoroelastomer =====
  "fe2601-series": {
    zh: "中、低门尼 VDF 基氟橡胶（FKM）二元生胶，氟含量 66.5%。适用于挤出与注压成型，可制造各类密封件、垫片与管件。",
    en: "Medium-to-low Mooney VDF-based binary FKM raw rubber, 66.5% fluorine. Used for extrusion and injection-compression molding to make seals, gaskets and pipe fittings.",
  },
  "fe2602-series": {
    zh: "超高门尼 VDF 基氟橡胶（FKM）二元生胶，氟含量 66.5%。适用于模压成型，可制造大型与厚壁密封件、滚轴等模压制品。",
    en: "Ultra-high Mooney VDF-based binary FKM raw rubber, 66.5% fluorine. Used for compression molding of large and thick-walled seals, rollers and similar molded parts.",
  },
  "fe2603-series": {
    zh: "双峰分子量分布的中、低门尼 VDF 基氟橡胶（FKM）二元生胶，氟含量 66.5%。适用于模压、挤出与注压成型，可制造密封件、管件与异型橡胶件。",
    en: "Bimodal-MW medium-to-low Mooney VDF-based binary FKM raw rubber, 66.5% fluorine. Used for compression, extrusion and injection-compression molding of seals, pipe fittings and shaped rubber parts.",
  },
  "fe2604-series": {
    zh: "中、低门尼 VDF 基氟橡胶（FKM）二元生胶，氟含量 66.5%。适用于模压与挤出成型，可制造密封件、O 形圈与挤出型材。",
    en: "Medium-to-low Mooney VDF-based binary FKM raw rubber, 66.5% fluorine. Used for compression and extrusion molding of seals, O-rings and extruded profiles.",
  },
  "fe2605-series": {
    zh: "低门尼 VDF 基氟橡胶（FKM）二元生胶，氟含量 66.5%。适用于挤出、注压与注射成型，流动性高，可制造复杂截面与小型精密件。",
    en: "Low-Mooney VDF-based binary FKM raw rubber, 66.5% fluorine. Used for extrusion, injection-compression and injection molding — high flow for complex profiles and small precision parts.",
  },
  "fe2462-series": {
    zh: "超高分子量 VDF 基氟橡胶（FKM）三元生胶，氟含量 68%。适用于模压成型，可制造大型与厚壁密封件、衬里、阀座等模压制品。",
    en: "Ultra-high MW VDF-based ternary FKM raw rubber, 68% fluorine. Used for compression molding of large / thick-walled seals, linings and valve seats.",
  },
  "fe2463-series": {
    zh: "中、低门尼 VDF 基氟橡胶（FKM）三元生胶，氟含量 67.5%。适用于挤出与注压成型，可制造密封件、垫片与管件。",
    en: "Medium-to-low Mooney VDF-based ternary FKM raw rubber, 67.5% fluorine. Used for extrusion and injection-compression molding of seals, gaskets and pipe fittings.",
  },
  "fe2465-series": {
    zh: "中、低门尼 VDF 基氟橡胶（FKM）三元生胶，氟含量 68.5%。适用于模压、挤出、注压与压延成型，可制造各类密封件、垫片、管件与片材。",
    en: "Medium-to-low Mooney VDF-based ternary FKM raw rubber, 68.5% fluorine. Used for compression, extrusion, injection-compression and calendering — suitable for seals, gaskets, pipe fittings and sheets.",
  },
  "fe2465l-series": {
    zh: "中、低门尼 VDF 基氟橡胶（FKM）低温改性生胶，氟含量 66%、玻璃化温度约 −20°C — 较二元 FKM 具备更优耐低温性能。适用于模压、挤出与注射成型，可制造低温及燃料系统密封件。",
    en: "Medium-to-low Mooney VDF-based FKM low-temperature-modified raw rubber, 66% fluorine, Tg ≈ −20°C — better low-temperature performance than standard binary FKM. Used for compression, extrusion and injection molding of low-temperature and fuel-system seals.",
  },
  "fe2465g-series": {
    zh: "中、低门尼 VDF 基氟橡胶（FKM）高氟含量三元生胶，氟含量 69.5% — 较常规 FKM 介质耐受性更优。适用于模压、挤出与注压成型，可制造耐油 / 燃料 / 化学介质密封件。",
    en: "Medium-to-low Mooney high-fluorine VDF-based ternary FKM raw rubber, 69.5% fluorine — better chemical-media resistance than standard FKM. Used for compression, extrusion and injection-compression molding of oil-, fuel- and chemical-resistant seals.",
  },
  "fe2465h-series": {
    zh: "中、低门尼 VDF 基氟橡胶（FKM）超高氟含量三元生胶，氟含量 70% — 系列中介质耐受性最强。适用于模压、挤出与注压成型，可制造苛刻介质环境下的密封件。",
    en: "Medium-to-low Mooney ultra-high-fluorine VDF-based ternary FKM raw rubber, 70% fluorine — top media resistance in the FKM series. Used for compression, extrusion and injection-compression molding of seals exposed to aggressive media.",
  },
  "pcfe2610-series": {
    zh: "中、低门尼粘度过氧化物硫化型 VDF 基氟橡胶（FKM）三元生胶，氟含量 66.5%、玻璃化温度约 −19°C。适用于过氧化物硫化体系（配合 TAIC 等交联剂），可制造耐高温、耐介质且耐低温的密封件。",
    en: "Medium-to-low Mooney peroxide-curable VDF-based ternary FKM raw rubber, 66.5% fluorine, Tg ≈ −19°C. Cures with peroxide systems (e.g. paired with TAIC) to make seals with high-temperature, chemical and low-temperature performance.",
  },
  "pcfe24610-series": {
    zh: "中、低门尼粘度过氧化物硫化型 VDF 基氟橡胶（FKM）四元生胶，氟含量 68.5%（在三元基础上增加 TFE 单体）— 介质耐受性较 PCFE2610 更优。适用于过氧化物硫化体系，可制造苛刻介质环境下的耐高低温密封件。",
    en: "Medium-to-low Mooney peroxide-curable VDF-based quaternary FKM raw rubber, 68.5% fluorine (TFE monomer added on top of the ternary backbone) — better media resistance than PCFE2610. Cures with peroxide systems for seals in aggressive media with high / low-temperature requirements.",
  },
  "fe2701-series": {
    zh: "TFE-丙烯共聚氟橡胶（FEPM）生胶，氟含量 57%、长期使用温度 200°C — 较 VDF 基 FKM 具有更优的耐碱性与耐胺性。适用于挤出成型并经辐照交联，主要用于耐热电线电缆绝缘。",
    en: "TFE-propylene fluoroelastomer (FEPM) raw rubber, 57% fluorine, long-term service 200°C — better base and amine resistance than VDF-based FKM. Used for extrusion followed by radiation crosslinking, primarily for heat-resistant wire & cable insulation.",
  },
  "fe2600d-series": {
    zh: "用于制备聚合物加工助剂（PPA）的 FKM 水基分散液，固含量约 27%。适用于乳液型 PPA 配方生产，作为聚烯烃加工助剂的关键中间体。",
    en: "FKM water-based dispersion for the preparation of polymer processing aids (PPA), ~27% solid content. Used in emulsion-type PPA formulations as a key intermediate for polyolefin processing aids.",
  },
  "fe2651-series": {
    zh: "粉末态聚合物加工助剂（PPA），密度 1.76 g/cm³。适用于聚烯烃（HDPE / LLDPE / PP）的挤出与吹塑工艺，可消除熔体破裂、降低模压压力与加工温度、提高生产效率。",
    en: "Powder-form polymer processing aid (PPA), density 1.76 g/cm³. Added to polyolefins (HDPE / LLDPE / PP) in extrusion and blow molding to eliminate melt fracture, reduce die pressure and processing temperature, and increase throughput.",
  },
  "pfe4010-series": {
    zh: "全氟醚橡胶（FFKM）生胶系列，氟含量 72.5%、适用温度 −10°C 至 230°C — 对腐蚀性介质提供最广泛的耐受性与优秀压缩永久变形。适用于模压成型，可制造苛刻工况下的 O 型圈、垫圈、阀体与机械密封件。",
    en: "Perfluoroether elastomer (FFKM) raw rubber series, 72.5% fluorine, service −10°C to 230°C — broadest media resistance with excellent compression set. Used for compression molding of O-rings, gaskets, valve bodies and mechanical seals in aggressive process environments.",
  },

  // ===== pvdf =====
  "pvdf-coating-grade": {
    zh: "涂料级 PVDF 粉末（VDF 均聚），加工窗口宽、烘干成膜耐候性优异。适用于建筑外墙烘干型 PVDF 氟碳涂料，与丙烯酸树脂及助剂配方使用。",
    en: "Coating-grade PVDF powder (VDF homopolymer) — wide processing window with excellent baked-film weather resistance. Used in baking-type PVDF fluorocarbon coatings for exterior building walls, formulated with acrylic resin and additives.",
  },
  "pvdf-lithium-grade": {
    zh: "锂电级 PVDF 粉末，覆盖正极粘合剂与隔膜涂层应用。适用于锂离子电池正极极片涂布（LFP / 三元体系）及隔膜涂层 — 提供乳液均聚、悬浮改性、乳液共聚三种工艺类型供选择。",
    en: "Lithium-grade PVDF powders covering positive-cathode binder and separator-coating applications. Used in Li-ion battery cathode coating (LFP / ternary systems) and separator coating — available in emulsion-homopolymer, modified-suspension and emulsion-copolymer forms.",
  },
  "pvdf-water-film-grade": {
    zh: "水膜级 PVDF 粉末（VDF 均聚），机械韧性与耐化学性优异。适用于 NIPS 与 TIPS 工艺过滤膜制备 — 提供乳液与悬浮两种聚合方式的牌号供选择。",
    en: "Water-film-grade PVDF powder (VDF homopolymer) with strong mechanical toughness and chemical resistance. Used in NIPS- and TIPS-process filtration-membrane preparation — available in emulsion and suspension forms.",
  },
  "pvdf-solar-backsheet": {
    zh: "光伏背板级 PVDF 粉末（乳液均聚），耐 UV 辐照、阻燃、易加工。适用于光伏组件背板膜挤出，可显著延长背板服役寿命。",
    en: "Solar-backsheet-grade PVDF powder (emulsion homopolymer) — UV resistance, flame retardance and easy processing. Used for extrusion of PV-module backsheet film with significant service-life extension.",
  },
  "pvdf-product-grade": {
    zh: "通用级 PVDF（粉料与颗粒），机械强度、耐磨性与耐化学性优异且具良好熔融加工性。适用于注塑与挤出工艺，可制成片材、复合膜、阀门、管材、罐体等部件。",
    en: "General-purpose PVDF (powder and pellet) — excellent mechanical strength, abrasion and chemical resistance with good melt processability. Used for injection molding and extrusion to make sheets, composite films, valves, pipes and tanks.",
  },
  "pvdf-copolymer": {
    zh: "VDF-HFP 共聚 PVDF（粉料与颗粒），兼具机械强度与柔韧性、绝缘性能突出。适用于挤出与模压成型，主要用于电缆护套、光纤护套及高柔韧氟塑制品。",
    en: "VDF-HFP copolymer PVDF (powder and pellet) — combines mechanical strength with flexibility plus outstanding insulation. Used for extrusion and compression molding of cable sheathing, optical-fiber sheathing and high-flexibility fluoropolymer parts.",
  },

  // ===== ptfe =====
  "ptfe-fr101": {
    zh: "中粒度悬浮 PTFE 树脂粉末，平均粒径约 200 μm、熔点 327±5°C。适用于模压成型，可制造板材、棒材、薄膜及异型件 — 系列内 3 个牌号区分洁净度与流动性。",
    en: "Medium-particle suspension PTFE resin powder, average particle size ~200 μm, melting point 327±5°C. Used for compression molding of plates, rods, films and shaped parts — three grades differentiated by cleanliness and flow.",
  },
  "ptfe-fr104": {
    zh: "细粒度悬浮 PTFE 树脂粉末，平均粒径约 25 μm、熔点 327±5°C。适用于模压成型，可制造高强度、电气绝缘及高拉伸性能制品 — 系列内 4 个牌号区分性能侧重。",
    en: "Fine-particle suspension PTFE resin powder, average particle size ~25 μm, melting point 327±5°C. Used for compression molding of high-strength, electrically insulating and high-elongation parts — four grades differentiated by performance focus.",
  },
  "ptfe-fr202": {
    zh: "中分子量分散 PTFE 树脂粉末，平均粒径约 480 μm、熔点 327±10°C。适用于糊膏挤出加工，可制造生料带及异型挤出件。",
    en: "Medium-MW dispersion PTFE resin powder, average particle size ~480 μm, melting point 327±10°C. Used for paste extrusion of raw-material (sealing) tapes and shaped extruded parts.",
  },
  "ptfe-fr203": {
    zh: "高分子量分散 PTFE 树脂粉末，平均粒径约 500 μm、耐压耐热性能良好。适用于糊膏挤出加工，可制造中高密度生料带及 PTFE 长纤与短纤。",
    en: "High-MW dispersion PTFE resin powder, average particle size ~500 μm, good pressure and heat resistance. Used for paste extrusion of medium-to-high-density raw tapes plus long and short PTFE fibers.",
  },
  "ptfe-fr204": {
    zh: "超高分子量分散 PTFE 树脂粉末，平均粒径约 500 μm、耐压耐热性能良好。适用于糊膏挤出加工，可制造单 / 双向拉伸薄膜与挤出管材，用于服装薄膜、医药过滤膜及膨化板材。",
    en: "Ultra-high-MW dispersion PTFE resin powder, average particle size ~500 μm, good pressure and heat resistance. Used for paste extrusion of uni- / bi-directional stretch films and extruded tubes — for garment films, pharmaceutical filter films and expanded boards.",
  },
  "ptfe-fr301k": {
    zh: "PTFE 浓缩水基分散液，固含量约 60%、pH 8–10。适用于工程塑料阻燃滴落剂的生产，作为关键功能添加剂。",
    en: "PTFE concentrated aqueous dispersion, ~60% solids, pH 8–10. Used in producing flame-retardant anti-drip agents for engineering plastics as a key functional additive.",
  },
  "ptfe-fr302-fr304d": {
    zh: "PTFE 浓缩水基分散液系列，固含量约 60%、pH 8–10。适用于浸渍工艺，可制造浸渍玻纤基布、PTFE 盘根及多层浸渍制品。",
    en: "PTFE concentrated aqueous dispersion series, ~60% solids, pH 8–10. Used in dipping processes to make impregnated glass-fiber cloth, PTFE packing and multi-layer dipped products.",
  },
  "ptfe-fr303-fr306w": {
    zh: "PTFE 浓缩水基分散液系列，固含量约 60%、pH 8–10。适用于涂料配方，可制造不粘锅涂层、熨衣板底面涂层等涂料制品。",
    en: "PTFE concentrated aqueous dispersion series, ~60% solids, pH 8–10. Used in coating formulations for non-stick pan coatings, ironing-board bottom coatings and similar applications.",
  },
  "ptfe-fr305w": {
    zh: "改性 PTFE 浓缩水基分散液，固含量约 51%、熔点 305±10°C — 高温下具备良好流动性。适用作 PTFE 涂料的添加剂，改善涂层表面性能与高光泽。",
    en: "Modified PTFE concentrated aqueous dispersion, ~51% solids, melting point 305±10°C — good fluidity at high temperature. Used as an additive in PTFE coatings to improve surface performance and gloss.",
  },
  "ptfe-fr307f-fr308f": {
    zh: "环保型 PTFE 浓缩水基分散液系列，固含量 27–62%、熔点 327±10°C。适用于 PTFE 基覆铜板（CCL）的生产，可用于高频高速板材。",
    en: "Eco-friendly PTFE concentrated aqueous dispersion series, 27–62% solids, melting point 327±10°C. Used to produce PTFE-based copper-clad laminates (CCL) for high-frequency / high-speed PCBs.",
  },

  // ===== fep =====
  "fep-fr462": {
    zh: "FEP 模压级颗粒（TFE-HFP 共聚），熔点 260°C、长期使用温度 200°C — 兼具优异耐温、耐腐蚀与电绝缘性。适用于模压成型，可制造阀门、管道、衬里、接头及板材棒材。",
    en: "FEP compression-molding pellet (TFE-HFP copolymer), Tm 260°C, long-term service 200°C — excellent thermal, corrosion and electrical insulation performance. Used for compression molding of valves, pipelines, linings, joints and plates / rods.",
  },
  "fep-fr460-fr461": {
    zh: "FEP 挤出级颗粒（TFE-HFP 共聚），熔点 260°C、长期使用温度 200°C。适用于挤出、注塑与吹塑工艺，可制造管材、异型件与薄膜 — 系列内 2 个牌号区分熔融指数。",
    en: "FEP extrusion-grade pellet (TFE-HFP copolymer), Tm 260°C, long-term service 200°C. Used for extrusion, injection molding and blow molding of pipes, shaped parts and films — two grades differentiated by MFI.",
  },
  "fep-fr463": {
    zh: "FEP 浓缩水基分散液（TFE-HFP 共聚），固含量约 50%、pH 7–9。适用于浸渍和涂料工艺，可作模具脱模剂及机械与器具表面的不粘涂层。",
    en: "FEP concentrated aqueous dispersion (TFE-HFP copolymer), ~50% solids, pH 7–9. Used in impregnation and coating processes as a mold release agent and anti-adhesive coating for machinery and appliances.",
  },
  "fep-fr468": {
    zh: "FEP 电缆级颗粒（TFE-HFP 共聚），熔点 258°C、长期使用温度 200°C。适用于电线电缆绝缘层挤出，按熔融指数区分可生产各种直径与厚度的绝缘包覆 — 系列内 3 个牌号区分挤出速度需求。",
    en: "FEP cable-grade pellet (TFE-HFP copolymer), Tm 258°C, long-term service 200°C. Used for wire & cable insulation extrusion — three grades differentiated by MFI to match line-speed requirements.",
  },

  // ===== pfa =====
  "pfa-fr511": {
    zh: "PFA 模压级颗粒（TFE-PPVE 共聚），熔点 305–315°C、长期使用温度 260°C — 兼具 PTFE 级化学惰性与可熔融加工性。适用于模压与挤出，可制造阀门、管道、衬里、接头及大直径管材棒材。",
    en: "PFA compression-molding pellet (TFE-PPVE copolymer), Tm 305–315°C, long-term service 260°C — PTFE-level chemical inertness combined with melt processability. Used for compression molding and extrusion of valves, pipelines, linings, joints and large-diameter pipes / rods.",
  },
  "pfa-fr512": {
    zh: "PFA 挤出级颗粒（TFE-PPVE 共聚），熔点 305–315°C、长期使用温度 260°C。适用于挤出工艺，可挤出尺寸稳定性高的管材与片材。",
    en: "PFA extrusion-grade pellet (TFE-PPVE copolymer), Tm 305–315°C, long-term service 260°C. Used for extrusion of pipes and sheets with high dimensional stability.",
  },
  "pfa-fr513": {
    zh: "PFA 注塑级颗粒（TFE-PPVE 共聚），熔点 305–315°C、长期使用温度 260°C。适用于注塑成型，可制造复杂形状零部件以及接头、弯头等管件。",
    en: "PFA injection-grade pellet (TFE-PPVE copolymer), Tm 305–315°C, long-term service 260°C. Used for injection molding of complex-shaped parts plus joints, elbows and other pipe fittings.",
  },
  "pfa-fr515": {
    zh: "PFA 电缆级颗粒（TFE-PPVE 共聚），熔点 305–315°C、长期使用温度 260°C。适用于高速挤出，可制造电线电缆绝缘包覆。",
    en: "PFA cable-grade pellet (TFE-PPVE copolymer), Tm 305–315°C, long-term service 260°C. Used for high-speed extrusion of wire & cable insulation coverings.",
  },

  // ===== fluorine-fine-chemicals =====
  "ffc-hfpo": {
    zh: "六氟环氧丙烷（HFPO），分子式 C₃F₆O、沸点 −27°C、纯度 ≥99.3%。重要含氟中间体，用于合成全氟聚醚（PFPE）、PPVE 及含氟表面活性剂等高级含氟功能化合物。",
    en: "Hexafluoropropylene oxide (HFPO), formula C₃F₆O, boiling point −27°C, purity ≥99.3%. Key fluorinated intermediate for the synthesis of perfluoropolyethers (PFPE), PPVE and fluorinated surfactants — end uses span chemicals, batteries, semiconductors and aerospace.",
  },
  "ffc-f2n2": {
    zh: "氟氮混合气（F₂/N₂），强氧化剂，氟纯度 ≥99%。用于化学法制备六氟化硫、三氟化氮等有机 / 无机氟化物，以及氟化石墨与氟化沥青的制备。",
    en: "Fluorine-nitrogen mixture (F₂/N₂), strong oxidizer, fluorine purity ≥99%. Used in the chemical preparation of sulfur hexafluoride, nitrogen trifluoride and other organic / inorganic fluorides, plus fluorographite polymer and fluorinated asphalt.",
  },
  "ffc-hfa-3h2o": {
    zh: "六氟丙酮三水合物（HFA·3H₂O），分子式 C₃F₆O·3H₂O、沸点 106–108°C、纯度 ≥99%。用于医药、农药中间体合成，以及含氟弹性体的聚合或改性。",
    en: "Hexafluoroacetone trihydrate (HFA·3H₂O), formula C₃F₆O·3H₂O, boiling point 106–108°C, purity ≥99%. Used in the synthesis of pharmaceutical / agrochemical intermediates and in the polymerization or modification of fluoroelastomers.",
  },
  "ffc-hfip": {
    zh: "六氟异丙醇（HFIP），分子式 C₃H₂F₆O、沸点 59°C、纯度 ≥99.95%。高极性、低粘度、低表面张力的含氟溶剂，用于七氟醚（吸入麻醉剂）合成、塑料回收及医药农药合成。",
    en: "Hexafluoroisopropanol (HFIP), formula C₃H₂F₆O, boiling point 59°C, purity ≥99.95%. High-polarity, low-viscosity, low-surface-tension fluorinated solvent — used in sevoflurane (inhalational anaesthetic) synthesis, plastic recycling and pharmaceutical / agrochemical synthesis.",
  },
  "ffc-bpaf": {
    zh: "双酚 AF（BPAF），分子式 C₁₅H₁₀F₆O₂、熔点 160–163°C、纯度 ≥99.5%。主要用作氟橡胶硫化促进剂，也是含氟聚合物与含氟化学品合成的关键中间体。",
    en: "Bisphenol AF (BPAF), formula C₁₅H₁₀F₆O₂, melting point 160–163°C, purity ≥99.5%. Primarily used as a fluororubber vulcanization accelerator and as a key intermediate for fluorinated polymer and chemical synthesis.",
  },
  "ffc-pfpe": {
    zh: "全氟聚醚（PFPE）液体系列，含氟饱和长链聚醚 — 优异化学惰性、宽工作温度、低蒸气压。适用于特种润滑油 / 润滑脂、半导体设备传热液、精密电子清洗、汽相焊接及数据中心浸没式冷却液。",
    en: "Perfluoropolyether (PFPE) liquid series — fluorinated saturated polyether with broad chemical inertness, wide service temperature and low vapor pressure. Used in specialty lubricating oils / greases, semiconductor heat-transfer fluids, precision electronics cleaning, vapor-phase soldering and data-center immersion coolants.",
  },
  "ffc-hfpo-trimer": {
    zh: "六氟环氧丙烷三聚物（HFPO trimer），分子式 C₉F₁₈O₃、沸点 113°C、纯度 ≥95%。用于含氟表面活性剂的合成。",
    en: "Hexafluoropropylene oxide trimer (HFPO trimer), formula C₉F₁₈O₃, boiling point 113°C, purity ≥95%. Used in the synthesis of fluorinated surfactants.",
  },
  "ffc-ppve": {
    zh: "全氟丙基乙烯基醚（PPVE），分子式 C₅F₁₀O、沸点 160–163°C、纯度 ≥99.5%。含氟乙烯基醚类共聚单体，用于 PFA、改性 PTFE 等含氟聚合物的合成，以及农化、医药领域的有机分子功能化。",
    en: "Perfluoropropyl vinyl ether (PPVE), formula C₅F₁₀O, boiling point 160–163°C, purity ≥99.5%. Fluorinated vinyl-ether comonomer used in PFA, modified PTFE and other fluoropolymer synthesis, and in functionalizing organic molecules for agrochemicals and pharmaceuticals.",
  },
  "ffc-hfbd": {
    zh: "六氟丁二烯（HFBD），分子式 C₄F₆、沸点 6–7°C、纯度 ≥99.90%。含氟单体兼半导体行业高深宽比刻蚀气体 — 较传统全氟烷烃（PFC）刻蚀气体污染更低、选择性更优。",
    en: "Hexafluorobutadiene (HFBD), formula C₄F₆, boiling point 6–7°C, purity ≥99.90%. Fluorinated monomer and high-aspect-ratio etching gas for the semiconductor industry — lower atmospheric impact and better selectivity than legacy perfluoroalkane (PFC) etching gases.",
  },
};

// -----------------------------------------------------------------------------
// Variant descriptions — 1 short sentence each (~30–60 zh chars), focused on
// what makes THIS grade differ from its siblings in the series. Variants whose
// only purpose is "the only grade in the series" still get a description so
// the UI doesn't render an empty slot.
// -----------------------------------------------------------------------------
const VARIANT_DESCRIPTIONS: Record<string, I18n> = {
  // ===== fluororesin / jf-series =====
  "jf-2x": { zh: "JF 系列基础牌号，酸值 6±1。", en: "Base grade of the JF series; acid value 6±1." },
  "jf-3x": {
    zh: "在 JF-2X 的基础上降低酸值（3±1），匹配更宽的配方窗口。",
    en: "Lower acid value (3±1) than JF-2X for a wider formulation window.",
  },
  "jf-5x": {
    zh: "JF-2X 升级牌号 — 优化分子量分布、提升耐候性。",
    en: "Upgraded JF-2X with optimized molecular-weight distribution and enhanced weather resistance.",
  },
  "jf-2x65": {
    zh: "JF-2X 高固含量版本（65±2%）— 同等性能下降低 VOC。",
    en: "High-solids version of JF-2X (65±2%) for lower VOC at equivalent performance.",
  },
  "jf-2x-benzene-free": {
    zh: "JF-2X 无苯溶剂版本 — 同等性能下环保配方。",
    en: "Benzene-free solvent version of JF-2X with equivalent performance.",
  },
  "jf-3x-benzene-free": {
    zh: "JF-3X 无苯溶剂版本 — 同等性能下环保配方。",
    en: "Benzene-free solvent version of JF-3X with equivalent performance.",
  },

  // ===== fluororesin / zhm-2-series =====
  "zhm-2": {
    zh: "ZHM-2 系列基础牌号 — 平衡固含量与施工粘度。",
    en: "Base grade of the ZHM-2 series — balanced solid content and application viscosity.",
  },
  "zhm-260": {
    zh: "与 ZHM-2 同固含量，更低粘度便于施工。",
    en: "Same solid content as ZHM-2 with lower viscosity for easier application.",
  },
  "zhm-265": {
    zh: "ZHM-2 高固含量版本（65±2%）— 更低 VOC、更环保。",
    en: "High-solids version of ZHM-2 (65±2%) — lower VOC and a better environmental profile.",
  },
  "zhm-265h": {
    zh: "ZHM-265 高羟值版本（100±10）— 提高交联密度与涂层耐化学性。",
    en: "High-hydroxyl version of ZHM-265 (100±10) — higher crosslink density and improved chemical resistance.",
  },

  // ===== fluororesin / zhm-5-series =====
  "zhm-5": {
    zh: "ZHM-5 基础牌号 — 较高分子量（30000–40000）以满足卷材成膜性能要求。",
    en: "ZHM-5 base grade — higher molecular weight (30 000–40 000) for coil-film performance requirements.",
  },
  "zhm-g1": {
    zh: "ZHM-5 引入柔性乙烯基醚单体 — 更低 Tg、更高断裂伸长率，匹配铝型材与幕墙涂料。",
    en: "ZHM-5 modified with a flexible vinyl-ether comonomer — lower Tg, higher elongation, suited to aluminum profile and curtain-wall coatings.",
  },

  // ===== fluororesin / zhm-modified-series =====
  "zhm-3": {
    zh: "改性系列基础牌号，固含量 60±2%、氟含量 20±1%。",
    en: "Modified-series base grade; solid content 60±2%, fluorine content 20±1%.",
  },
  "zhm-70": {
    zh: "改性系列高固含量牌号（70±2%）— 降低 VOC，适配光伏背板涂层。",
    en: "High-solids grade (70±2%) for lower VOC — tuned for PV backsheet coatings.",
  },
  "zhm-80": {
    zh: "改性系列高固含量低粘度牌号 — 更宽工艺窗口与更高施工效率。",
    en: "High-solids, low-viscosity grade — wider processing window and higher application efficiency.",
  },

  // ===== fluororesin / zht-series =====
  "zht": {
    zh: "中昊基于 TFE 的新一代氟碳树脂 — 区别于 CTFE 体系（JF / ZHM）属另一氟塑骨架家族。",
    en: "Zhonghao's next-generation TFE-based fluorocarbon resin — a different polymer-backbone family from the CTFE-based JF / ZHM series.",
  },

  // ===== fluoroelastomer / fe2601-series =====
  "fe2601-30": {
    zh: "门尼粘度 35（较低）— 流动性优，适合复杂截面挤出。",
    en: "Mooney 35 (lower) — excellent flow, suited to complex extrusion profiles.",
  },
  "fe2601-40": {
    zh: "门尼粘度 45（中等）— 综合加工平衡，通用性强。",
    en: "Mooney 45 (mid) — balanced processability, broad applicability.",
  },
  "fe2601-50": {
    zh: "门尼粘度 55（较高）— 抗形变能力更强，适合厚壁件。",
    en: "Mooney 55 (higher) — better deformation resistance, suited to thick-wall parts.",
  },

  // ===== fluoroelastomer / fe2602-series =====
  "fe2602-100": { zh: "门尼粘度 100 — 系列起步牌号。", en: "Mooney 100 — entry grade in the series." },
  "fe2602-120": {
    zh: "门尼粘度 120 — 平衡流动性与机械强度。",
    en: "Mooney 120 — balanced flow and mechanical strength.",
  },
  "fe2602-140": {
    zh: "门尼粘度 145 — 高门尼制品的常用选择。",
    en: "Mooney 145 — common choice for high-Mooney compounds.",
  },
  "fe2602-170": {
    zh: "门尼粘度 175 — 系列最高门尼牌号，机械性能最优。",
    en: "Mooney 175 — highest-Mooney grade in the series, best mechanical performance.",
  },

  // ===== fluoroelastomer / fe2603-series =====
  "fe2603-50": { zh: "门尼 50 — 双峰分布起步牌号。", en: "Mooney 50 — entry bimodal grade." },
  "fe2603-60": { zh: "门尼 60 — 流动性与强度的平衡。", en: "Mooney 60 — balanced flow and strength." },
  "fe2603-70": {
    zh: "门尼 70 — 注压制品适用，门尼分布最高。",
    en: "Mooney 70 — suited to injection-compression, highest Mooney in series.",
  },

  // ===== fluoroelastomer / fe2604-series =====
  "fe2604-60": { zh: "门尼 65 — 通用模压挤出牌号。", en: "Mooney 65 — general molding & extrusion grade." },
  "fe2604-70": {
    zh: "门尼 75 — 中等门尼，机械性能更佳。",
    en: "Mooney 75 — mid-range Mooney with better mechanical performance.",
  },
  "fe2604-80": {
    zh: "门尼 85 — 系列最高门尼，适合厚壁模压件。",
    en: "Mooney 85 — highest in series, suited to thick-wall molded parts.",
  },

  // ===== fluoroelastomer / fe2605-series =====
  "fe2605": {
    zh: "FE2605 系列唯一牌号 — 门尼粘度 25，注射成型首选。",
    en: "Sole grade in the FE2605 series — Mooney 25, preferred for injection molding.",
  },

  // ===== fluoroelastomer / fe2462-series =====
  "fe2462": { zh: "门尼 70 — 三元 FKM 基础牌号。", en: "Mooney 70 — base ternary FKM grade." },
  "fe2462m": {
    zh: "门尼 80 — 强化版本（M），机械强度更优。",
    en: "Mooney 80 — reinforced version (M) with higher mechanical strength.",
  },

  // ===== fluoroelastomer / fe2463-series =====
  "fe2463": {
    zh: "FE2463 系列唯一牌号 — 门尼 45，三元 FKM 通用牌号。",
    en: "Sole grade in the series — Mooney 45, general-purpose ternary FKM.",
  },

  // ===== fluoroelastomer / fe2465-series =====
  "fe2465-20": {
    zh: "门尼 25 — 流动性最佳，适合复杂注压。",
    en: "Mooney 25 — highest flow, suited to complex injection-compression.",
  },
  "fe2465-40": { zh: "门尼 40 — 通用挤出与模压牌号。", en: "Mooney 40 — general extrusion and compression grade." },
  "fe2465-60": { zh: "门尼 60 — 平衡机械强度与加工性。", en: "Mooney 60 — balanced mechanical strength and processability." },
  "fe2465-80": { zh: "门尼 80 — 最高门尼，适合厚壁模压。", en: "Mooney 80 — highest Mooney, suited to thick-wall molding." },

  // ===== fluoroelastomer / fe2465l-series =====
  "fe2465l-20": { zh: "门尼 25 — 低温改性系列流动性最佳。", en: "Mooney 25 — best flow in the low-temp series." },
  "fe2465l-40": { zh: "门尼 40 — 通用低温牌号。", en: "Mooney 40 — general low-temperature grade." },
  "fe2465l-60": { zh: "门尼 60 — 低温改性高强度牌号。", en: "Mooney 60 — high-strength low-temperature grade." },

  // ===== fluoroelastomer / fe2465g-series =====
  "fe2465g-20": { zh: "门尼 25 — 高氟系列流动性最佳。", en: "Mooney 25 — best flow in the high-fluorine series." },
  "fe2465g-40": { zh: "门尼 40 — 通用高氟牌号。", en: "Mooney 40 — general high-fluorine grade." },
  "fe2465g-60": { zh: "门尼 60 — 平衡介质耐受性与加工性。", en: "Mooney 60 — balanced media resistance and processability." },
  "fe2465g-80": { zh: "门尼 80 — 厚壁模压适用。", en: "Mooney 80 — suited to thick-wall molding." },
  "fe2465g-100": {
    zh: "门尼 100 — 最高门尼，机械性能最优。",
    en: "Mooney 100 — highest Mooney, best mechanical performance.",
  },

  // ===== fluoroelastomer / fe2465h-series =====
  "fe2465h-20": { zh: "门尼 25 — 超高氟系列流动性最佳。", en: "Mooney 25 — best flow in the ultra-high-fluorine series." },
  "fe2465h-40": { zh: "门尼 40 — 通用超高氟牌号。", en: "Mooney 40 — general ultra-high-fluorine grade." },
  "fe2465h-60": { zh: "门尼 60 — 平衡介质耐受性与加工性。", en: "Mooney 60 — balanced media resistance and processability." },
  "fe2465h-80": { zh: "门尼 80 — 系列最高门尼。", en: "Mooney 80 — highest Mooney in series." },

  // ===== fluoroelastomer / pcfe2610-series =====
  "pcfe2611": { zh: "门尼 15 — 过硫系列流动性最佳。", en: "Mooney 15 — best flow in the peroxide-cure series." },
  "pcfe2612": { zh: "门尼 25 — 通用过硫牌号。", en: "Mooney 25 — general peroxide-cure grade." },
  "pcfe2613": { zh: "门尼 35 — 平衡过硫性能与流动性。", en: "Mooney 35 — balanced cure and flow." },
  "pcfe2614": { zh: "门尼 45 — 中高门尼过硫牌号。", en: "Mooney 45 — mid-high Mooney peroxide-cure grade." },
  "pcfe2615": { zh: "门尼 55 — 系列最高门尼。", en: "Mooney 55 — highest Mooney in series." },

  // ===== fluoroelastomer / pcfe24610-series =====
  "pcfe24612": { zh: "门尼 25 — 高氟过硫起步牌号。", en: "Mooney 25 — entry high-fluorine peroxide-cure grade." },
  "pcfe24613": { zh: "门尼 35 — 通用高氟过硫牌号。", en: "Mooney 35 — general high-fluorine peroxide-cure grade." },
  "pcfe24614": { zh: "门尼 45 — 平衡介质耐受性与加工性。", en: "Mooney 45 — balanced media resistance and processability." },
  "pcfe24615": { zh: "门尼 55 — 中高门尼牌号。", en: "Mooney 55 — mid-high Mooney grade." },
  "pcfe24616": { zh: "门尼 65 — 系列最高门尼。", en: "Mooney 65 — highest Mooney in series." },

  // ===== fluoroelastomer / fe2701-series =====
  "fe2701": {
    zh: "FEPM 唯一牌号 — 门尼 106，专为耐热电线电缆设计。",
    en: "Sole FEPM grade — Mooney 106, designed for heat-resistant wire & cable.",
  },

  // ===== fluoroelastomer / fe2600d-series =====
  "fe2600d": {
    zh: "FE2600D 系列唯一牌号 — 门尼 55、pH 6.5 的 PPA 中间体分散液。",
    en: "Sole grade in the series — PPA-intermediate dispersion at Mooney 55, pH 6.5.",
  },

  // ===== fluoroelastomer / fe2651-series =====
  "fe2651": {
    zh: "FE2651 系列唯一牌号 — 直接加入 HDPE / LLDPE / PP 工艺的粉末 PPA。",
    en: "Sole grade in the series — powder PPA directly added to HDPE / LLDPE / PP processing.",
  },

  // ===== fluoroelastomer / pfe4010-series =====
  "pfe4013": { zh: "门尼 30 — FFKM 系列起步牌号。", en: "Mooney 30 — entry FFKM grade." },
  "pfe4014": { zh: "门尼 45 — 通用 FFKM 牌号。", en: "Mooney 45 — general FFKM grade." },
  "pfe4015": { zh: "门尼 55 — 平衡机械强度与流动性。", en: "Mooney 55 — balanced strength and flow." },
  "pfe4016": { zh: "门尼 65 — 中高门尼 FFKM 牌号。", en: "Mooney 65 — mid-high Mooney FFKM grade." },
  "pfe4017": { zh: "门尼 75 — 适合厚壁模压。", en: "Mooney 75 — suited to thick-wall molding." },
  "pfe4019": {
    zh: "门尼 95 — 系列最高门尼，机械性能最优。",
    en: "Mooney 95 — highest Mooney, best mechanical performance.",
  },

  // ===== pvdf / pvdf-coating-grade =====
  "pvdf-t-1": {
    zh: "T-1 — 国内首款涂料级 PVDF，Stormer 粘度 ≥95。",
    en: "T-1 — first domestic coating-grade PVDF; Stormer viscosity ≥95.",
  },
  "pvdf-t-1w2": {
    zh: "T-1W2 — T-1 升级版，Stormer 粘度 ≥85，工艺适应性更广。",
    en: "T-1W2 — upgraded T-1; lower Stormer (≥85) and broader formulation tolerance.",
  },

  // ===== pvdf / pvdf-lithium-grade =====
  "pvdf-fr909w": {
    zh: "FR909W — 乳液均聚 LFP 正极粘合剂，溶解快、粘结性高。",
    en: "FR909W — emulsion-homopolymer LFP cathode binder; fast dissolution, high adhesion.",
  },
  "pvdf-fr908xg": {
    zh: "FR908XG — 悬浮改性三元正极粘合剂，减少粘合剂用量同时保持粘结力。",
    en: "FR908XG — modified-suspension ternary cathode binder; lower binder loading at retained adhesion.",
  },
  "pvdf-fr9601w": {
    zh: "FR9601W — 乳液共聚隔膜涂层材料，兼顾粘结力与柔韧性。",
    en: "FR9601W — emulsion-copolymer separator-coating material balancing adhesion and flexibility.",
  },

  // ===== pvdf / pvdf-water-film-grade =====
  "pvdf-fr904w": {
    zh: "FR904W — 乳液均聚牌号，中等分子量、溶解性好。",
    en: "FR904W — emulsion homopolymer; medium MW, good solubility.",
  },
  "pvdf-fr903x": {
    zh: "FR903X — 悬浮均聚牌号，相对低分子量、低粘度。",
    en: "FR903X — suspension homopolymer; lower MW and viscosity.",
  },

  // ===== pvdf / pvdf-solar-backsheet =====
  "pvdf-fr906w": {
    zh: "FR906W — 国产光伏背板 PVDF 开创者，已稳定使用十余年。",
    en: "FR906W — pioneer of domestic PV-backsheet PVDF, in stable use for over a decade.",
  },

  // ===== pvdf / pvdf-product-grade =====
  "pvdf-fr916w": {
    zh: "FR916W — 高熔指（230°C / 5 kg, MFI 8–30）注塑级。",
    en: "FR916W — high-MFI (230°C / 5 kg, 8–30) injection grade.",
  },
  "pvdf-fr907w": {
    zh: "FR907W — 粉料通用牌号，机械与拉伸性能均衡。",
    en: "FR907W — general-purpose powder grade with balanced mechanical and tensile performance.",
  },
  "pvdf-fr917w": {
    zh: "FR917W — 高负荷熔指（230°C / 12.5 kg, MFI 10–25）挤出级。",
    en: "FR917W — high-load MFI (230°C / 12.5 kg, 10–25) extrusion grade.",
  },

  // ===== pvdf / pvdf-copolymer =====
  "pvdf-fr9611w": {
    zh: "FR9611W — 低熔指共聚牌号（MFI 3–8），柔韧性突出。",
    en: "FR9611W — low-MFI copolymer (3–8); outstanding flexibility.",
  },
  "pvdf-fr9603w": {
    zh: "FR9603W — 粉料形态，机械与柔韧性均衡。",
    en: "FR9603W — powder form; balanced mechanical and flexibility profile.",
  },
  "pvdf-fr9613w": {
    zh: "FR9613W — 高 HFP 比例（熔点 131–141°C），低温柔韧性最佳。",
    en: "FR9613W — higher HFP ratio (Tm 131–141°C); best low-temperature flexibility.",
  },

  // ===== ptfe / ptfe-fr101 =====
  "ptfe-fr101-1": {
    zh: "高洁净度模压级 — 适合板材、棒材、薄膜等高洁净度制品。",
    en: "High-cleanliness molding grade — suited to high-cleanliness plates, rods and films.",
  },
  "ptfe-fr101-2": {
    zh: "普通模压级 — 通用模压制品的标准选择。",
    en: "Standard compression grade — default choice for general molded parts.",
  },
  "ptfe-fr101-3": {
    zh: "半自由流动级 — 适合小型与异型件模压加工。",
    en: "Semi-free-flow grade — suited to molding small parts and shaped products.",
  },

  // ===== ptfe / ptfe-fr104 =====
  "ptfe-fr104-1": {
    zh: "普通模压级 — 通用细粒度模压件。",
    en: "Standard molding grade — general fine-particle molded parts.",
  },
  "ptfe-fr104-2": {
    zh: "高强度填充级 — 适合填料复合制品（玻纤、碳纤、青铜等）。",
    en: "High-strength filler grade — suited to filled composites (glass / carbon fiber, bronze, etc.).",
  },
  "ptfe-fr104-3": {
    zh: "电气绝缘级 — 薄膜、车削板等致密制品。",
    en: "Electrical-insulation grade — dense products such as films and turned boards.",
  },
  "ptfe-fr104-4": {
    zh: "高强度模压级 — 高拉伸强度模压或填充件。",
    en: "High-strength compression grade — molded or filled parts with top tensile strength.",
  },

  // ===== ptfe / ptfe-fr202 =====
  "ptfe-fr202-1": {
    zh: "FR202-1 — 通用生料带牌号，拉伸强度 ≥25 MPa。",
    en: "FR202-1 — general raw-tape grade, tensile strength ≥25 MPa.",
  },
  "ptfe-fr202-2": {
    zh: "FR202-2 — 高强度生料带牌号，拉伸强度 ≥30 MPa。",
    en: "FR202-2 — high-strength raw-tape grade, tensile strength ≥30 MPa.",
  },

  // ===== ptfe / ptfe-fr203 =====
  "ptfe-fr203": {
    zh: "FR203 系列唯一牌号 — 拉伸强度 ≥24 MPa，覆盖生料带与纤维制品。",
    en: "Sole grade in the series — tensile strength ≥24 MPa, covering raw tapes and fibers.",
  },

  // ===== ptfe / ptfe-fr204 =====
  "ptfe-fr204": {
    zh: "FR204 系列唯一牌号 — 超高分子量分散树脂，热不稳定指数 ≤10。",
    en: "Sole grade in the series — ultra-high-MW dispersion resin, thermal-instability index ≤10.",
  },

  // ===== ptfe / ptfe-fr301k =====
  "ptfe-fr301k": {
    zh: "FR301K 系列唯一牌号 — 阻燃滴落剂专用 PTFE 分散液。",
    en: "Sole grade in the series — PTFE dispersion dedicated to anti-drip-agent production.",
  },

  // ===== ptfe / ptfe-fr302-fr304d =====
  "ptfe-fr302w": {
    zh: "FR302W — 通用浸渍牌号，粘度 10×10⁻³~35×10⁻³。",
    en: "FR302W — general dipping grade, viscosity 10×10⁻³–35×10⁻³.",
  },
  "ptfe-fr302hw": {
    zh: "FR302HW — 高粘度浸渍牌号，适合厚层浸渍。",
    en: "FR302HW — higher-viscosity dipping grade for thicker coats.",
  },
  "ptfe-fr304d": {
    zh: "FR304D — 多层浸渍专用牌号，表面活性剂含量更高（6.4%）。",
    en: "FR304D — multi-layer dipping grade with higher surfactant (6.4%).",
  },

  // ===== ptfe / ptfe-fr303-fr306w =====
  "ptfe-fr303": { zh: "FR303 — 通用涂料牌号。", en: "FR303 — general coating grade." },
  "ptfe-fr303hw": {
    zh: "FR303HW — 高粘度涂料牌号，适合厚涂层。",
    en: "FR303HW — higher-viscosity coating grade for thicker films.",
  },
  "ptfe-fr306w": {
    zh: "FR306W — 高表面活性剂含量牌号，涂层厚度表现更优。",
    en: "FR306W — higher-surfactant grade with superior coating-thickness performance.",
  },

  // ===== ptfe / ptfe-fr305w =====
  "ptfe-fr305w": {
    zh: "FR305W 系列唯一牌号 — 改性 PTFE 分散液，作为 PTFE 涂料的表面改性添加剂。",
    en: "Sole grade in the series — modified PTFE dispersion used as a surface-improvement additive for PTFE coatings.",
  },

  // ===== ptfe / ptfe-fr307f-fr308f =====
  "ptfe-fr307f": {
    zh: "FR307F — 高固含量（59–62%）覆铜板专用牌号。",
    en: "FR307F — high-solids (59–62%) CCL-dedicated grade.",
  },
  "ptfe-fr308f": {
    zh: "FR308F — 低固含量（27–30%）覆铜板专用牌号，适合薄层涂布。",
    en: "FR308F — low-solids (27–30%) CCL grade suited to thin-layer coating.",
  },

  // ===== fep =====
  "fep-fr462": {
    zh: "FR462 系列唯一牌号 — 熔融指数 0.8–2.0，FEP 模压通用牌号。",
    en: "Sole grade in the series — MFI 0.8–2.0, general-purpose FEP compression grade.",
  },
  "fep-fr460": {
    zh: "FR460 — 高熔指（MFI 4–12），适合薄膜与高速挤出。",
    en: "FR460 — higher MFI (4–12), suited to film and high-speed extrusion.",
  },
  "fep-fr461": {
    zh: "FR461 — 中熔指（MFI 2.1–3.9），通用挤出牌号。",
    en: "FR461 — mid-MFI (2.1–3.9), general extrusion grade.",
  },
  "fep-fr463": {
    zh: "FR463 系列唯一牌号 — 浸渍 / 涂料用 FEP 分散液。",
    en: "Sole grade in the series — FEP dispersion for impregnation and coating.",
  },
  "fep-fr468-1": { zh: "FR468-1 — MFI 12–20，标准挤出速度。", en: "FR468-1 — MFI 12–20, standard extrusion speed." },
  "fep-fr468-2": { zh: "FR468-2 — MFI 20–28，中高速挤出。", en: "FR468-2 — MFI 20–28, medium-high speed." },
  "fep-fr468-3": { zh: "FR468-3 — MFI 28–35，最高挤出速度。", en: "FR468-3 — MFI 28–35, highest line speed." },

  // ===== pfa =====
  "pfa-fr511": {
    zh: "FR511 系列唯一牌号 — MFI 0.8–3.0，PFA 模压通用牌号。",
    en: "Sole grade in the series — MFI 0.8–3.0, general-purpose PFA compression grade.",
  },
  "pfa-fr512": {
    zh: "FR512 系列唯一牌号 — MFI 3.1–8.0，PFA 挤出通用牌号。",
    en: "Sole grade in the series — MFI 3.1–8.0, general-purpose PFA extrusion grade.",
  },
  "pfa-fr513": {
    zh: "FR513 系列唯一牌号 — MFI 8.1–18.0,PFA 注塑通用牌号。",
    en: "Sole grade in the series — MFI 8.1–18.0, general-purpose PFA injection grade.",
  },
  "pfa-fr515": {
    zh: "FR515 系列唯一牌号 — MFI 18.1–40.0,PFA 电缆高速挤出专用。",
    en: "Sole grade in the series — MFI 18.1–40.0, dedicated PFA grade for high-speed cable extrusion.",
  },

  // ===== fluorine-fine-chemicals =====
  "ffc-hfpo": {
    zh: "HFPO — 纯度 ≥99.3%、含水量 ≤50 ppm 的电子级气体。",
    en: "HFPO — electronic-grade gas at ≥99.3% purity and moisture ≤50 ppm.",
  },
  "ffc-f2n2-10": {
    zh: "F₂/N₂ 10% (V) — 10% 体积浓度混合气，常规氟化反应。",
    en: "F₂/N₂ 10% (V) — 10 vol% fluorine for standard fluorination reactions.",
  },
  "ffc-f2n2-20": {
    zh: "F₂/N₂ 20% (V) — 20% 体积浓度混合气，高反应活性需求。",
    en: "F₂/N₂ 20% (V) — 20 vol% fluorine for higher-reactivity applications.",
  },
  "ffc-hfa-3h2o": {
    zh: "HFA·3H₂O 系列唯一牌号 — 纯度 ≥99%、pH 3–4 的水合物液体。",
    en: "Sole grade in the series — trihydrate liquid at ≥99% purity, pH 3–4.",
  },
  "ffc-hfip": {
    zh: "HFIP 系列唯一牌号 — 高纯电子级溶剂,纯度 ≥99.95%。",
    en: "Sole grade in the series — high-purity electronic-grade solvent at ≥99.95% purity.",
  },
  "ffc-bpaf": {
    zh: "BPAF 系列唯一牌号 — 高纯固体,纯度 ≥99.5%。",
    en: "Sole grade in the series — high-purity solid at ≥99.5%.",
  },
  "ffc-pfpe-fy-pa170": {
    zh: "FY-PA170 — 低沸点（170°C）传热与清洗用 PFPE。",
    en: "FY-PA170 — low-boiling-point (170°C) PFPE for heat transfer and cleaning.",
  },
  "ffc-pfpe-fy-pa200": {
    zh: "FY-PA200 — 中沸点（200°C）传热与清洗用 PFPE。",
    en: "FY-PA200 — mid-boiling-point (200°C) PFPE for heat transfer and cleaning.",
  },
  "ffc-pfpe-fy-pb01": {
    zh: "FY-PB01 — 低粘度（40 cSt）润滑型 PFPE，分子量 ~1700。",
    en: "FY-PB01 — low-viscosity (40 cSt) lubricating PFPE, MW ~1700.",
  },
  "ffc-pfpe-fy-pb02": {
    zh: "FY-PB02 — 中粘度（135 cSt）润滑型 PFPE，分子量 ~2800。",
    en: "FY-PB02 — mid-viscosity (135 cSt) lubricating PFPE, MW ~2800.",
  },
  "ffc-pfpe-fy-pb03": {
    zh: "FY-PB03 — 高粘度（260 cSt）润滑型 PFPE，分子量 ~3500。",
    en: "FY-PB03 — high-viscosity (260 cSt) lubricating PFPE, MW ~3500.",
  },
  "ffc-pfpe-fy-pb04": {
    zh: "FY-PB04 — 超高粘度（1630 cSt）润滑型 PFPE，分子量 ~7500。",
    en: "FY-PB04 — ultra-high-viscosity (1630 cSt) lubricating PFPE, MW ~7500.",
  },
  "ffc-hfpo-trimer": {
    zh: "HFPO trimer 系列唯一牌号 — 纯度 ≥95%，含氟表面活性剂合成原料。",
    en: "Sole grade in the series — ≥95% purity, feedstock for fluorinated surfactants.",
  },
  "ffc-ppve": {
    zh: "PPVE 系列唯一牌号 — 纯度 ≥99.5% 的共聚单体。",
    en: "Sole grade in the series — ≥99.5%-purity comonomer.",
  },
  "ffc-hfbd-3n": {
    zh: "HFBD-3N — 纯度 ≥99.90% (3N)，半导体通用级。",
    en: "HFBD-3N — ≥99.90% purity (3N), general semiconductor grade.",
  },
  "ffc-hfbd-4n": {
    zh: "HFBD-4N — 纯度 ≥99.99% (4N)，含水量 ≤5 ppm,高端电子级。",
    en: "HFBD-4N — ≥99.99% purity (4N), moisture ≤5 ppm, high-end electronic grade.",
  },
};

// -----------------------------------------------------------------------------
// Apply
// -----------------------------------------------------------------------------
//
// Strategy: text-level surgical replacement, not JSON re-serialize.
// products.json was hand-formatted with column alignment, blank lines between
// sections, and inline `{ zh, en }` pairs. A naive `JSON.stringify(..., null, 2)`
// round-trip would clobber all of that — bloating a 5 000-line file to 10 000+
// lines of pure cosmetic diff. Instead we find each existing description's JSON
// representation in the source text and swap only those bytes, leaving every
// other character untouched.
type Variant = { id: string; description?: I18n; [k: string]: unknown };
type Series = { id: string; description?: I18n; variants?: Variant[]; [k: string]: unknown };
type Doc = { series: Series[]; [k: string]: unknown };

/**
 * Anchor a replacement at the variant or series object that owns the given
 * id. Returns the [start, end) byte range covering the `"description": …,`
 * line (including a possible trailing comma) and the indent prefix to use for
 * the replacement.
 *
 * The source file uses three description shapes:
 *   "description": null
 *   "description": { "zh": "…", "en": "…" }          (single-line inline)
 *   "description": {\n  "zh": "…",\n  "en": "…"\n }  (expanded over 4 lines)
 *
 * All three are caught by anchoring on the `"id": "<id>"` line, then finding
 * the next `"description":` within the same object, then parsing forward until
 * the value ends (null | }).
 */
function findDescriptionSpan(text: string, id: string): { start: number; end: number; indent: string; afterIdEnd: number } | null {
  const idLine = `"id": ${JSON.stringify(id)}`;
  const idIdx = text.indexOf(idLine);
  if (idIdx === -1) return null;

  // Find the start of the line containing this id (for indent calculation).
  const lineStart = text.lastIndexOf("\n", idIdx) + 1;
  const indent = text.slice(lineStart, idIdx);

  // Find the end of the id line — the comma after the id value.
  const afterIdEnd = text.indexOf("\n", idIdx);

  // Look for the next "description": within this object.
  // Bounded by the next `"id":` (start of next sibling) just to be safe.
  const nextId = text.indexOf(`"id": "`, idIdx + idLine.length);
  const slice = nextId === -1 ? text.slice(idIdx) : text.slice(idIdx, nextId);

  const descIdx = slice.indexOf(`"description":`);
  if (descIdx === -1) return { start: -1, end: -1, indent, afterIdEnd };
  const absDescIdx = idIdx + descIdx;

  // Start of the line containing "description": (include leading whitespace
  // so the replacement preserves indentation).
  const descLineStart = text.lastIndexOf("\n", absDescIdx) + 1;

  // Walk forward from `"description":` to find the end of its value.
  let p = absDescIdx + `"description":`.length;
  // Skip whitespace
  while (p < text.length && (text[p] === " " || text[p] === "\t")) p++;

  let valueEnd: number;
  if (text.startsWith("null", p)) {
    valueEnd = p + 4;
  } else if (text[p] === "{") {
    // Walk to matching close brace, handling strings.
    let depth = 0;
    let inString = false;
    let escape = false;
    for (; p < text.length; p++) {
      const ch = text[p];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (inString) {
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { p++; break; }
      }
    }
    valueEnd = p;
  } else {
    return null; // unexpected shape
  }

  // Include trailing comma if present.
  if (text[valueEnd] === ",") valueEnd++;
  // Include the trailing newline so the whole line is replaceable.
  if (text[valueEnd] === "\n") valueEnd++;

  return { start: descLineStart, end: valueEnd, indent, afterIdEnd };
}

/** Build the description line(s) using the same compact inline form. */
function buildDescriptionLine(indent: string, neu: I18n): string {
  const zh = JSON.stringify(neu.zh);
  const en = JSON.stringify(neu.en);
  return `${indent}"description": { "zh": ${zh}, "en": ${en} },\n`;
}

function main() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const data = JSON.parse(raw) as Doc;

  const seriesById = new Map<string, Series>();
  const variantById = new Map<string, Variant>();
  for (const s of data.series) {
    seriesById.set(s.id, s);
    for (const v of s.variants ?? []) variantById.set(v.id, v);
  }

  // Validate every patched ID exists.
  const missingSeries = Object.keys(SERIES_DESCRIPTIONS).filter(
    (id) => !seriesById.has(id),
  );
  const missingVariants = Object.keys(VARIANT_DESCRIPTIONS).filter(
    (id) => !variantById.has(id),
  );
  if (missingSeries.length || missingVariants.length) {
    console.error("Patch references unknown IDs:");
    if (missingSeries.length) console.error("  series:", missingSeries);
    if (missingVariants.length) console.error("  variants:", missingVariants);
    process.exit(1);
  }

  // Validate coverage — series must all be patched; variants are best-effort.
  const unpatchedSeries = [...seriesById.keys()].filter(
    (id) => !(id in SERIES_DESCRIPTIONS),
  );
  if (unpatchedSeries.length) {
    console.error("Series missing from patch:", unpatchedSeries);
    process.exit(1);
  }
  const unpatchedVariants = [...variantById.keys()].filter(
    (id) => !(id in VARIANT_DESCRIPTIONS),
  );
  if (unpatchedVariants.length) {
    console.warn(
      `[warn] ${unpatchedVariants.length} variants left unpatched (keeping existing descriptions):`,
      unpatchedVariants,
    );
  }

  // Walk patches in REVERSE source order so that earlier byte offsets stay
  // valid as we mutate later regions.
  type Patch = { id: string; kind: "series" | "variant"; neu: I18n; idOffset: number };
  let text = raw;

  const patches: Patch[] = [];
  for (const [id, neu] of Object.entries(SERIES_DESCRIPTIONS)) {
    const idOffset = text.indexOf(`"id": ${JSON.stringify(id)}`);
    if (idOffset === -1) throw new Error(`series:${id} not found in source`);
    patches.push({ id, kind: "series", neu, idOffset });
  }
  for (const [id, neu] of Object.entries(VARIANT_DESCRIPTIONS)) {
    const idOffset = text.indexOf(`"id": ${JSON.stringify(id)}`);
    if (idOffset === -1) throw new Error(`variant:${id} not found in source`);
    patches.push({ id, kind: "variant", neu, idOffset });
  }
  patches.sort((a, b) => b.idOffset - a.idOffset);

  let seriesChanged = 0;
  let variantsChanged = 0;
  const failures: string[] = [];

  for (const { id, kind, neu } of patches) {
    const span = findDescriptionSpan(text, id);
    if (!span) {
      failures.push(`${kind}:${id} — unexpected span shape`);
      continue;
    }
    if (span.start === -1) {
      // No description block at all — insert one right after the id line.
      const line = buildDescriptionLine(span.indent, neu);
      text = text.slice(0, span.afterIdEnd + 1) + line + text.slice(span.afterIdEnd + 1);
    } else {
      // Replace the existing block with a compact inline form.
      const replacement = buildDescriptionLine(span.indent, neu);
      text = text.slice(0, span.start) + replacement + text.slice(span.end);
    }
    if (kind === "series") seriesChanged++;
    else variantsChanged++;
  }

  if (failures.length) {
    console.error("Couldn't apply some patches:");
    for (const m of failures) console.error("  -", m);
    process.exit(1);
  }

  // Sanity check: round-trip parse to make sure we didn't break JSON.
  try {
    JSON.parse(text);
  } catch (e) {
    console.error("Post-patch JSON is invalid:", (e as Error).message);
    process.exit(1);
  }

  fs.writeFileSync(DATA_PATH, text, "utf8");
  console.log(
    `✓ Patched ${seriesChanged} series + ${variantsChanged} variants in ${path.relative(
      ROOT,
      DATA_PATH,
    )}`,
  );
}

main();
