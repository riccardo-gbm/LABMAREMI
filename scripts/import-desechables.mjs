/**
 * import-desechables.mjs — create the desechables / plásticos line
 *
 * The RESTAURANTES sheet of "LISTA PRECIOS - LABMAREMI.xlsx" carries ~96 rows
 * the database never had, which is why "Desechables para alimentos" sat empty.
 * Those rows are sizes, not products: the sheet lists one family per block and
 * one row per size, exactly like the rest of the price list. Following the
 * convention already in `products`, each family becomes ONE row with its sizes
 * joined into `presentation` — 17 for desechables, 4 for plásticos industriales.
 *
 * Gavetas and Tachos also appear in that sheet but already exist in the
 * database; scripts/recategorize-products.mjs refiles them instead, so they are
 * deliberately absent here.
 *
 * SAFE TO RE-RUN. A slug that already exists is skipped, never updated and
 * never duplicated, so a second run is a no-op.
 *
 * Run:  node scripts/import-desechables.mjs
 *       node scripts/import-desechables.mjs --dry-run    (report, write nothing)
 *
 * Credentials: SUPABASE_SERVICE_ROLE_KEY, or ADMIN_EMAIL + ADMIN_PASSWORD.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import { slugify } from "./slugify.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DRY_RUN = process.argv.includes("--dry-run")

/**
 * Copy follows the house convention: Spanish, formal register ("usted"),
 * a single-paragraph description and numbered steps for the modo de uso.
 * Written from the price-list names and sizes — there are no spec sheets
 * behind these, so material and food-contact claims are kept general.
 */
const PRODUCTS = [
  // ======================= Desechables para alimentos =======================
  {
    category: "desechables",
    name: "Contenedores Ecológicos",
    presentation: '5*5" 10UND / Compartido 8*8" 10UND / 9*5" UND / 9*9" 10UND',
    description:
      "Los Contenedores Ecológicos son envases para alimentos preparados fabricados con fibras vegetales prensadas, una alternativa de origen renovable frente al plástico y al poliestireno. Su estructura rígida resiste alimentos calientes, húmedos y grasosos sin deformarse ni traspasar líquidos, y su tapa abatible integrada cierra a presión para el transporte. Disponibles en formato sencillo y compartido, son la opción indicada para restaurantes, patios de comida, servicios de entrega a domicilio y catering que buscan reducir su huella ambiental.",
    recommended_use: [
      "Seleccione el formato según la porción a servir: sencillo para un plato único o compartido para separar la guarnición del plato principal.",
      "Sirva el alimento dejando un margen libre en el borde para que la tapa cierre sin presionar el contenido.",
      "Presione la tapa abatible hasta escuchar el clic de cierre y verifique el sellado antes de trasladar el pedido.",
      "Deseche el envase usado en el contenedor de residuos orgánicos o compostables según la normativa local de su establecimiento.",
    ],
  },
  {
    category: "desechables",
    name: "Platos Ecológicos",
    presentation: '6" 10UND / 9" 10UND / Compartido 9" 10UND / Ovalado 7*9" 10UND',
    description:
      "Los Platos Ecológicos están elaborados con fibra vegetal prensada de origen renovable, libre de recubrimientos plásticos. Ofrecen una superficie rígida y resistente que soporta alimentos calientes, salsas y cortes con cubierto sin doblarse ni humedecerse, manteniendo una presentación limpia durante todo el servicio. Su acabado natural aporta una imagen sobria y responsable, ideal para eventos, food trucks, comedores institucionales y establecimientos con política de sostenibilidad.",
    recommended_use: [
      "Elija el diámetro adecuado según el tipo de servicio: 6\" para entradas y postres, 9\" para plato fuerte y el formato ovalado para porciones alargadas.",
      "Utilice el plato compartido cuando requiera separar la proteína de los acompañamientos sin mezclar salsas.",
      "Sirva directamente sobre el plato y evite el uso prolongado en horno o parrilla.",
      "Descarte el plato usado en el contenedor de residuos orgánicos o compostables correspondiente.",
    ],
  },
  {
    category: "desechables",
    name: "Tarrinas Ecológicas",
    presentation:
      "Helado 4oz 25UND / Helado 10oz 25UND / Térmica c/tapa 16oz (1/2L) 25UND / Térmica c/tapa 28oz (3/4L) 25UND / Térmica c/tapa 32oz (1L) 25UND",
    description:
      "Las Tarrinas Ecológicas son recipientes de cartón con fibra de origen vegetal, diseñados para servir y transportar preparaciones frías y calientes. La línea térmica con tapa conserva la temperatura de sopas, caldos, cremas y guisos durante el traslado, mientras que los formatos de helado mantienen la consistencia de postres y productos refrigerados. Su pared resistente evita el reblandecimiento por humedad y su tapa a presión reduce el riesgo de derrames en entrega a domicilio.",
    recommended_use: [
      "Seleccione la capacidad según la porción: 4 y 10 oz para postres y helados, 16 a 32 oz para sopas, caldos y platos preparados.",
      "Llene la tarrina dejando aproximadamente un centímetro libre en el borde para permitir el cierre hermético de la tapa.",
      "Coloque la tapa presionando de manera uniforme sobre todo el contorno hasta asegurar el sellado.",
      "Traslade la tarrina en posición vertical y deséchela en el contenedor de residuos correspondiente tras su uso.",
    ],
  },
  {
    category: "desechables",
    name: "Cubiertos Ecológicos",
    presentation: "Mini cuchara 100UND / Cuchara 100UND / Tenedor 100UND / Cuchillo 100UND",
    description:
      "Los Cubiertos Ecológicos son utensilios de un solo uso fabricados con materiales de origen vegetal renovable, una alternativa al cubierto plástico convencional. Poseen la rigidez necesaria para cortar, pinchar y servir alimentos calientes o fríos sin quebrarse durante el uso normal, y su acabado mate natural aporta una presentación cuidada al servicio. Están disponibles en cuchara, mini cuchara, tenedor y cuchillo para armar el juego según el tipo de menú.",
    recommended_use: [
      "Arme el juego de cubiertos según el menú: mini cuchara para postres y degustación, cuchara, tenedor y cuchillo para el plato fuerte.",
      "Entregue los cubiertos en servilleta o empaque individual para preservar la higiene hasta el momento del consumo.",
      "Utilice sobre alimentos a temperatura de servicio; evite el contacto prolongado con preparaciones muy calientes.",
      "Deseche los cubiertos usados en el contenedor de residuos orgánicos o compostables de su establecimiento.",
    ],
  },
  {
    category: "desechables",
    name: "Vasos Ecológicos",
    presentation:
      "Salsero c/tapa 2oz 100UND / Salsero c/tapa 4oz 100UND / Papel exprés 4oz c/tapa 20UND / Papel café c/tapa 7oz 25UND / Papel blanco café c/tapa 8oz 25UND / Papel blanco café c/tapa 12oz 25UND / Papel café c/tapa 12oz 25UND / Cónico papel 4.5oz 200UND",
    description:
      "Los Vasos Ecológicos son recipientes de papel de origen renovable para bebidas calientes y frías, y para porcionado de salsas. La línea de café cuenta con pared resistente y tapa a presión que evita derrames en el traslado, mientras que los salseros de 2 y 4 oz permiten servir aderezos y acompañamientos de forma individual e higiénica. El formato cónico está pensado para dispensadores de agua en oficinas, plantas y salas de espera.",
    recommended_use: [
      "Escoja el formato según la bebida: 4 a 12 oz para café e infusiones, 2 a 4 oz para salsas y aderezos, y el vaso cónico para dispensadores de agua.",
      "Sirva la bebida dejando un margen libre en el borde y coloque la tapa presionando todo el contorno hasta asegurarla.",
      "Manipule los vasos con bebidas calientes por la zona superior o utilice funda protectora para evitar quemaduras.",
      "Deseche el vaso usado en el contenedor de residuos correspondiente una vez finalizado el consumo.",
    ],
  },
  {
    category: "desechables",
    name: "Removedores",
    presentation: "Madera 15cm 100UND / Paleta de helado 100UND / Sorbete coctelero 100UND",
    description:
      "Los Removedores son paletas de un solo uso fabricadas en madera de origen renovable, destinadas a mezclar azúcar, leche y endulzantes en bebidas calientes sin alterar su sabor. A diferencia del removedor plástico, no se deforman con el calor ni transfieren olores a la bebida. La línea incluye además paletas para helado y sorbetes cocteleros, útiles en cafeterías, heladerías, barras, salas de espera y estaciones de café corporativas.",
    recommended_use: [
      "Disponga los removedores en un dispensador o vaso de servicio junto a la estación de café, azúcar y endulzantes.",
      "Entregue una unidad por bebida y evite el contacto directo de las manos con el extremo que ingresa al líquido.",
      "Remueva la bebida hasta disolver completamente el azúcar o el endulzante.",
      "Deseche el removedor usado en el contenedor de residuos orgánicos o compostables.",
    ],
  },
  {
    category: "desechables",
    name: "Sorbetes Ecológicos",
    presentation: "Papel forrado 100UND / Fibra vegetal 100UND / Fibra vegetal forrado 100UND",
    description:
      "Los Sorbetes Ecológicos son pajillas de origen vegetal desarrolladas para reemplazar el sorbete plástico de un solo uso en bebidas frías. Su estructura conserva la firmeza durante el consumo habitual sin reblandecerse de inmediato ni alterar el sabor de la bebida. Las presentaciones forradas se entregan con envoltura individual, lo que preserva la higiene hasta el momento de servir y resulta indispensable en establecimientos sujetos a control sanitario.",
    recommended_use: [
      "Seleccione la presentación forrada cuando el sorbete se entregue directamente al comensal y requiera envoltura individual sellada.",
      "Coloque los sorbetes en un dispensador vertical o entréguelos junto con la bebida sin manipular el extremo de consumo.",
      "Utilícelos preferentemente en bebidas frías; evite dejarlos sumergidos por períodos prolongados.",
      "Deseche el sorbete usado en el contenedor de residuos orgánicos o compostables de su establecimiento.",
    ],
  },
  {
    category: "desechables",
    name: "Fundas de Papel Kraft",
    presentation:
      "N°1/2 6.5*16.5cm 50UND / N°1 8.5*19cm 100UND / N°2 10*22.5cm 100UND / N°3 11*25cm 100UND / N°4 11*33cm 100UND / N°6 15*27cm 100UND / N°12 16*38cm 100UND / N°25 21*51cm 100UND",
    description:
      "Las Fundas de Papel Kraft son bolsas de papel resistente de color natural para empacar y despachar alimentos, panadería, abarrotes y productos secos. Su fibra celulósica de alto gramaje soporta el peso del contenido sin rasgarse y permite la transpiración del producto, evitando la condensación que reblandece los alimentos horneados. Disponibles en ocho tamaños numerados, se adaptan desde porciones individuales hasta despachos de gran volumen.",
    recommended_use: [
      "Elija el número de funda según el volumen a empacar: N°1/2 a N°2 para porciones individuales y N°4 a N°25 para despachos mayores.",
      "Abra la funda por la boca y expanda la base antes de introducir el producto para aprovechar toda su capacidad.",
      "Cierre doblando el borde superior sobre sí mismo dos veces, o selle con etiqueta adhesiva del establecimiento.",
      "Evite empacar productos con alto contenido de líquido o grasa libre sin una barrera interna adecuada.",
    ],
  },
  {
    category: "desechables",
    name: "Contenedores Desechables",
    presentation:
      '5*5" 25UND / 6*6" 25UND / Compartido 8.5*8.7" 25UND / Llano 8.5*8.7" 25UND / Lonchera 9*6" 25UND / Vianda foam clip 700cc 25UND',
    description:
      "Los Contenedores Desechables son envases de poliestireno expandido para el despacho de comida preparada. Su estructura celular aísla térmicamente el contenido, conservando la temperatura del alimento durante el traslado, y su tapa abatible con cierre a presión evita derrames en el transporte. La línea cubre formatos llanos, compartidos, tipo lonchera y vianda con clip, cubriendo desde el menú ejecutivo hasta el despacho de porciones individuales.",
    recommended_use: [
      "Seleccione el formato según el menú: llano para plato único, compartido para separar guarniciones y lonchera o vianda para menú completo.",
      "Sirva el alimento sin sobrepasar el nivel del borde para que la tapa cierre correctamente.",
      "Presione la tapa por todo el contorno hasta accionar el clip de cierre y confirme el sellado antes de despachar.",
      "Deseche el envase usado en el contenedor de residuos correspondiente. No lo utilice en horno convencional ni sobre fuente de calor directa.",
    ],
  },
  {
    category: "desechables",
    name: "Platos Desechables",
    presentation: '6" 25UND / 9" 25UND / Compartido 10" 25UND / Ovalado 9*11" 25UND',
    description:
      "Los Platos Desechables son platos de un solo uso de superficie lisa y estructura rígida, pensados para el servicio de alimentos en alto volumen. Resisten el peso de porciones completas y el uso de cubierto sin doblarse, manteniendo el alimento contenido dentro del borde. Disponibles en formatos redondos, compartidos y ovalados, son un insumo básico en comedores institucionales, eventos masivos, food trucks y servicios de catering donde el lavado de vajilla no es viable.",
    recommended_use: [
      "Escoja el diámetro según el servicio: 6\" para entradas y postres, 9\" y 10\" para plato fuerte y el ovalado para porciones alargadas.",
      "Utilice el formato compartido cuando necesite servir proteína y guarniciones sin que se mezclen las salsas.",
      "Sirva el alimento centrado en el plato, respetando el borde para facilitar su manipulación.",
      "Deseche el plato usado en el contenedor de residuos correspondiente al finalizar el servicio.",
    ],
  },
  {
    category: "desechables",
    name: "Tarrinas Desechables",
    presentation:
      "Estriada c/tapa 1/2L 50UND / Estriada c/tapa 3/4L 50UND / Estriada c/tapa 1L 50UND / Choclo blanca c/tapa 1L 50UND / Llana c/tapa 1/2L 50UND / Llana c/tapa 1L 50UND",
    description:
      "Las Tarrinas Desechables son recipientes plásticos con tapa a presión para envasar, transportar y exhibir alimentos preparados. Su pared resistente soporta el manejo repetido sin fisurarse y la tapa cierra de forma segura para evitar derrames en el traslado. La versión estriada aporta rigidez adicional y mejor agarre, mientras que la tarrina llana ofrece una superficie despejada para etiquetado y exhibición en vitrina refrigerada.",
    recommended_use: [
      "Seleccione la capacidad según la porción: 1/2 litro para acompañamientos y 3/4 a 1 litro para sopas, guisos y platos completos.",
      "Llene la tarrina dejando un margen libre en el borde y limpie el reborde antes de colocar la tapa.",
      "Presione la tapa por todo el contorno hasta asegurar el cierre y verifique el sellado invirtiendo brevemente el envase.",
      "Etiquete el contenido y la fecha cuando el producto se destine a refrigeración o exhibición en vitrina.",
    ],
  },
  {
    category: "desechables",
    name: "Cubiertos Desechables",
    presentation:
      "Cucharita 50UND / Degustación 100UND / Cuchara blanca 50UND / Tenedor blanco 50UND / Cuchillo blanco 50UND / Cuchara negra 50UND / Tenedor negro 50UND / Cuchillo negro 50UND",
    description:
      "Los Cubiertos Desechables son utensilios plásticos de un solo uso para el servicio de alimentos en volumen. Ofrecen la resistencia necesaria para cortar y pinchar sin quebrarse durante el uso normal, y su superficie lisa facilita una presentación uniforme del servicio. La línea incluye cuchara, tenedor y cuchillo en blanco y negro, además de cucharita y cuchara de degustación, permitiendo armar el juego según el tipo de menú y la imagen del establecimiento.",
    recommended_use: [
      "Arme el juego según el menú: cuchara, tenedor y cuchillo para plato fuerte; cucharita y degustación para postres y muestras.",
      "Escoja el color blanco o negro de acuerdo con la línea gráfica de su establecimiento.",
      "Entregue los cubiertos envueltos en servilleta o en empaque individual para preservar la higiene hasta el consumo.",
      "Deseche los cubiertos usados en el contenedor de residuos correspondiente.",
    ],
  },
  {
    category: "desechables",
    name: "Vasos Plásticos",
    presentation:
      "Salsero boop c/tapa 1/2oz 50UND / Salsero boop c/tapa 1oz 50UND / Salsero boop 2oz 50UND / Salsero c/tapa 20cc 100UND / Gelatinero c/tapa 3oz 25UND / Transparente 5oz 50UND / 7oz 50UND / 10oz 50UND / 12oz 25UND / 14oz 25UND",
    description:
      "Los Vasos Plásticos son recipientes transparentes de un solo uso para bebidas frías, postres y porcionado de salsas. Su transparencia permite exhibir el contenido, lo que resulta especialmente útil en jugos, gelatinas, postres en vaso y productos de vitrina. Los salseros de 1/2 a 2 onzas y el formato de 20 cc con tapa permiten entregar aderezos de forma individual e higiénica, evitando la contaminación cruzada en el área de despacho.",
    recommended_use: [
      "Seleccione la capacidad según el uso: 1/2 a 2 oz y 20 cc para salsas, 3 oz para gelatinas y postres, 5 a 14 oz para bebidas frías.",
      "Sirva el contenido dejando margen en el borde y coloque la tapa presionando todo el contorno cuando la presentación lo requiera.",
      "Utilícelos exclusivamente con preparaciones frías o a temperatura ambiente; no los emplee con líquidos calientes.",
      "Deseche el vaso usado en el contenedor de residuos correspondiente.",
    ],
  },
  {
    category: "desechables",
    name: "Vasos Térmicos",
    presentation:
      "Térmico 4oz 25UND / 6oz 25UND / 8oz 25UND / 10oz 25UND / 12oz 10UND / Térmico c/tapa 10oz 25UND",
    description:
      "Los Vasos Térmicos son vasos de poliestireno expandido para bebidas calientes. Su estructura celular actúa como aislante, conservando la temperatura de la bebida por más tiempo y manteniendo la pared exterior fría al tacto, de modo que pueden sujetarse cómodamente sin funda protectora. Son el insumo habitual en estaciones de café de oficinas, plantas industriales, salas de espera y establecimientos con alta rotación de bebidas calientes.",
    recommended_use: [
      "Escoja la capacidad según la bebida: 4 a 6 oz para café exprés y 8 a 12 oz para café americano, infusiones y chocolate.",
      "Sirva la bebida dejando un margen libre en el borde para evitar derrames al trasladar el vaso.",
      "Utilice la presentación con tapa cuando la bebida deba transportarse fuera del punto de servicio.",
      "Deseche el vaso usado en el contenedor de residuos correspondiente. No lo utilice en horno microondas.",
    ],
  },
  {
    category: "desechables",
    name: "Porta Torta",
    presentation:
      'PET 8" UND / PET 9 1/2" UND / PET 11" UND / PET 12" UND / Brazo gitano PET 15*32*11cm UND',
    description:
      "Los Porta Torta son envases de PET transparente con base y cúpula para exhibir, proteger y transportar tortas, pasteles y postres de repostería. Su transparencia permite mostrar el producto terminado sin abrir el empaque, favoreciendo la venta en vitrina, y la cúpula alta protege la decoración y el glaseado durante el traslado. La línea incluye diámetros de 8 a 12 pulgadas y un formato rectangular para brazo gitano y postres alargados.",
    recommended_use: [
      "Seleccione el diámetro de acuerdo con el tamaño de la torta, dejando holgura suficiente para no dañar la decoración lateral.",
      "Coloque el producto centrado sobre la base y verifique que la altura de la cúpula no comprima la superficie decorada.",
      "Encaje la cúpula sobre la base presionando todo el contorno hasta asegurar el cierre.",
      "Traslade siempre en posición horizontal y mantenga el envase en refrigeración cuando el producto lo requiera.",
    ],
  },
  {
    category: "desechables",
    name: "Contenedores de Alimentos",
    presentation:
      "Transparente triangular 11*11*7cm UND / Transparente rectangular 23*16*8cm UND / Transparente cuadrado alto 10*10*5cm 50UND / Redondo negro c/tapa 20cm 1000cc 10UND / Conjunto pollera 26*12*18cm UND / Tres divisiones negro 22*16*5cm UND",
    description:
      "Los Contenedores de Alimentos son envases plásticos con tapa destinados al armado, exhibición y despacho de comida preparada. Los formatos transparentes permiten mostrar el producto en vitrina refrigerada o góndola de autoservicio, mientras que los contenedores negros ofrecen contraste visual que realza la presentación del alimento. La línea incluye el conjunto pollera para pollo entero y un formato de tres divisiones para menús completos sin mezcla de preparaciones.",
    recommended_use: [
      "Elija el formato según el producto: transparentes para exhibición en vitrina, negros para menú preparado y tres divisiones para plato completo.",
      "Arme la porción dentro del contenedor cuidando que ningún componente sobresalga del nivel de cierre.",
      "Coloque la tapa presionando todo el contorno y verifique el sellado antes de llevar el producto a vitrina o despacho.",
      "Etiquete con el contenido y la fecha de elaboración cuando el producto se destine a exhibición refrigerada.",
    ],
  },
  {
    category: "desechables",
    name: "Envases de Aluminio",
    presentation:
      "Rectangular c/tapa plástica C10 UND / C20 UND / C40 UND / Pack envase 32*22*5cm 5UND / Molde rectangular 52*32cm UND / Pavera ovalada 45*36*8cm UND",
    description:
      "Los Envases de Aluminio son recipientes de lámina de aluminio aptos para cocción, horneado, transporte y conservación de alimentos. A diferencia de los envases plásticos, resisten temperatura de horno y conducen el calor de manera uniforme, por lo que sirven tanto para preparar como para despachar el producto en el mismo recipiente. La línea abarca desde envases individuales con tapa plástica hasta moldes rectangulares grandes y pavera ovalada para piezas enteras.",
    recommended_use: [
      "Seleccione la capacidad según la porción: C10 a C40 para menú individual, molde y pavera para preparaciones de gran formato.",
      "Distribuya el alimento de manera uniforme dentro del envase para favorecer una cocción pareja.",
      "Retire la tapa plástica antes de introducir el envase al horno y colóquela nuevamente solo una vez que el contenido se haya atemperado.",
      "No utilice envases de aluminio en horno microondas. Deseche el envase usado en el contenedor de reciclaje de metales.",
    ],
  },

  // ========================= Plásticos Industriales =========================
  {
    category: "insumos-bano",
    name: "Bandejas Plásticas Industriales",
    presentation: "Multiuso 52*38*8cm UND / Charol 45*32*2cm UND",
    description:
      "Las Bandejas Plásticas Industriales son bandejas de polipropileno de alto impacto para el transporte, escurrido y organización de producto dentro de la operación. El formato multiuso, con altura de 8 cm, contiene piezas sueltas y líquidos de escurrido, mientras que el charol de perfil bajo está pensado para servicio, despacho y transporte de producto terminado. Ambas resisten lavado frecuente con detergentes y desinfectantes sin agrietarse ni retener olores.",
    recommended_use: [
      "Escoja el formato según la tarea: bandeja multiuso para contener y escurrir, charol para servicio y traslado de producto terminado.",
      "Distribuya la carga de manera uniforme y no exceda el nivel del borde para permitir el apilado seguro.",
      "Sujete la bandeja por ambos extremos al trasladarla, especialmente cuando contenga líquidos.",
      "Lave con agua y detergente neutro tras cada jornada, desinfecte si tuvo contacto con alimentos y deje secar al aire.",
    ],
  },
  {
    category: "insumos-bano",
    name: "Atomizadores",
    presentation: "650ml / 1000ml",
    description:
      "Los Atomizadores son envases pulverizadores con gatillo, destinados a dosificar soluciones de limpieza y desinfección diluidas en el punto de uso. Su boquilla regulable permite pasar de chorro dirigido a niebla fina, adaptando la aplicación a superficies pequeñas o áreas extensas y reduciendo el desperdicio de producto. El cuerpo translúcido facilita verificar el nivel restante y su capacidad de 650 y 1000 ml cubre desde la limpieza puntual hasta rutinas de jornada completa.",
    recommended_use: [
      "Prepare la solución en la dilución indicada por el fabricante del químico y viértala en el atomizador con ayuda de un embudo.",
      "Rotule el envase con el nombre del producto y su dilución; nunca reutilice un atomizador con un químico distinto sin lavarlo antes.",
      "Regule la boquilla a chorro para suciedad puntual o a niebla para cubrir superficies amplias, aplicando a 20 o 30 cm de distancia.",
      "Enjuague el atomizador y accione el gatillo con agua limpia al terminar, para evitar que el químico cristalice y obstruya el mecanismo.",
    ],
  },
  {
    category: "insumos-bano",
    name: "Pallets Plásticos",
    presentation: "Ecopiso c/regatón 60*40*4.5cm UND / Industrial Eco 120*100*14cm UND",
    description:
      "Los Pallets Plásticos son plataformas de polietileno de alta densidad para estibar mercadería aislándola del contacto directo con el piso, requisito habitual en bodegas de alimentos y auditorías de buenas prácticas de manufactura. A diferencia del pallet de madera, no absorbe humedad, no astilla, no aloja plagas y admite lavado y desinfección. El formato ecopiso con regatón sirve como tarima de apoyo en áreas húmedas y el industrial de 120*100 cm para estiba y transporte de carga paletizada.",
    recommended_use: [
      "Sitúe el pallet sobre piso nivelado y verifique que apoye de manera estable antes de cargarlo.",
      "Distribuya el peso de forma uniforme sobre la plataforma y no sobrepase la capacidad de carga indicada para el formato.",
      "Utilice el ecopiso con regatón como tarima de apoyo en áreas húmedas o de lavado, manteniendo el producto elevado del suelo.",
      "Lave con agua y detergente, desinfecte según el protocolo de su planta y deje escurrir antes de volver a estibar.",
    ],
  },
  {
    category: "insumos-bano",
    name: "Baldes Industriales",
    presentation:
      "Industrial 22L c/tapa / 10L c/tapa / 4L c/tapa / Transparente 20L c/tapa / 16L c/tapa / 12L c/tapa / 8L c/tapa",
    description:
      "Los Baldes Industriales son recipientes de polipropileno con tapa a presión para almacenar, dosificar y transportar líquidos, insumos y materia prima. Su pared reforzada resiste el manejo diario y el asa metálica soporta la carga completa sin deformar el cuerpo del balde. La línea transparente permite verificar el nivel y el estado del contenido sin destapar el envase, ventaja importante en control de inventario y en áreas de proceso de alimentos.",
    recommended_use: [
      "Seleccione la capacidad según el volumen a manejar, de 4 a 22 litros, y prefiera el balde transparente cuando necesite verificar el contenido a simple vista.",
      "Rotule el balde con el nombre del insumo y la fecha de envasado antes de almacenarlo.",
      "Cierre la tapa presionando todo el contorno hasta asegurar el sellado, especialmente si el contenido será transportado.",
      "Lave con agua y detergente neutro entre usos y no reutilice un balde con un producto químico distinto sin haberlo enjuagado a fondo.",
    ],
  },
]

// ---------------------------------------------------------------------------
function loadEnv() {
  const file = path.join(ROOT, ".env")
  if (!fs.existsSync(file)) die("No .env found at project root.")
  const env = {}
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue
    const i = line.indexOf("=")
    if (i === -1) continue
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { ...env, ...process.env }
}

function die(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

/** Same shape import-descriptions.mjs writes: steps separated by a blank line. */
const formatUse = (steps) => steps.map((s, i) => `${i + 1}. ${s}`).join("\n\n")

// ---------------------------------------------------------------------------
async function main() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  if (!url) die("VITE_SUPABASE_URL missing from .env")

  // --- validate the table before touching the database ----------------------
  const problems = []
  const seen = new Map()
  for (const p of PRODUCTS) {
    const slug = slugify(p.name)
    if (!slug) problems.push(`${p.name} — produces an empty slug`)
    if (seen.has(slug)) problems.push(`${p.name} — slug "${slug}" collides with "${seen.get(slug)}"`)
    seen.set(slug, p.name)
    if (!p.description?.trim()) problems.push(`${p.name} — empty description`)
    if (!p.recommended_use?.length) problems.push(`${p.name} — no modo de uso steps`)
    if (!p.presentation?.trim()) problems.push(`${p.name} — empty presentation`)
  }
  if (problems.length) {
    console.error("\n✖ validation failed — nothing was written:\n")
    for (const p of problems) console.error(`   ${p}`)
    process.exit(1)
  }
  console.log(`✓ ${PRODUCTS.length} products defined, slugs unique`)

  let supabase
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    console.log("✓ authenticated with the service role key")
  } else if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    supabase = createClient(url, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
    const { error } = await supabase.auth.signInWithPassword({
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    })
    if (error) die(`Admin sign-in failed: ${error.message}`)
    console.log(`✓ signed in as ${env.ADMIN_EMAIL}`)
  } else {
    die(
      "No write credentials. Add SUPABASE_SERVICE_ROLE_KEY, or ADMIN_EMAIL +\n" +
        "  ADMIN_PASSWORD, to .env. The publishable key is read-only here by design.",
    )
  }

  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug, name")
  if (catErr) die(`could not read categories: ${catErr.message}`)
  const catBySlug = new Map(cats.map((c) => [c.slug, c]))
  const missing = [...new Set(PRODUCTS.map((p) => p.category))].filter((c) => !catBySlug.has(c))
  if (missing.length) die(`unknown categories: ${missing.join(", ")}`)

  const { data: existing, error: readErr } = await supabase.from("products").select("slug, name")
  if (readErr) die(`could not read products: ${readErr.message}`)
  const haveSlug = new Set(existing.map((r) => r.slug))
  const haveName = new Set(existing.map((r) => r.name))

  const toInsert = []
  const skipped = []
  for (const p of PRODUCTS) {
    const slug = slugify(p.name)
    if (haveSlug.has(slug)) { skipped.push(`${p.name} — slug already exists`); continue }
    if (haveName.has(p.name)) { skipped.push(`${p.name} — name already exists`); continue }
    toInsert.push({
      name: p.name,
      slug,
      category_id: catBySlug.get(p.category).id,
      description: p.description.trim(),
      presentation: p.presentation.trim(),
      recommended_use: formatUse(p.recommended_use),
      is_active: true,
      // image_url intentionally omitted — populated later by upload-product-images.mjs.
    })
  }

  console.log(`\n  insert : ${toInsert.length}`)
  console.log(`  skip   : ${skipped.length}`)
  for (const s of skipped) console.log(`   ${s}`)
  console.log("\n  Inserting:")
  for (const p of toInsert) {
    console.log(`   ${catBySlug.get(PRODUCTS.find((x) => x.name === p.name).category).name.padEnd(30)} ${p.name}`)
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: no writes performed.")
    return
  }
  if (!toInsert.length) {
    console.log("\n✓ nothing to do — every product already exists.")
    return
  }

  const { data, error } = await supabase.from("products").insert(toInsert).select("slug")
  if (error) die(`insert failed: ${error.message}`)
  console.log(`\n✓ products created: ${data.length}/${toInsert.length}`)

  const { count } = await supabase.from("products").select("*", { count: "exact", head: true })
  console.log(`  products table now holds: ${count} rows`)
}

main().catch((e) => die(e?.message ?? String(e)))
