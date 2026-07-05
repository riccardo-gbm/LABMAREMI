import type { Product } from "@/types"

export const products: Product[] = [
  // Desinfectantes
  {
    id: "alcohol-antiseptico-70",
    name: "Alcohol Antiséptico 70°",
    categoryId: "desinfectantes",
    description:
      "Alcohol antiséptico de uso general para desinfección de superficies y manos en entornos comerciales.",
    presentation: "Galón 3.785 L",
    recommendedUse:
      "Desinfección de superficies, mesas de trabajo y manos antes de la manipulación de alimentos.",
  },
  {
    id: "hipoclorito-sodio-5",
    name: "Hipoclorito de Sodio 5%",
    categoryId: "desinfectantes",
    description:
      "Cloro líquido concentrado para desinfección profunda de pisos, baños y áreas de alto tránsito.",
    presentation: "Bidón 20 L",
    recommendedUse:
      "Desinfección de pisos, baños y áreas comunes. Diluir según el nivel de suciedad.",
  },
  {
    id: "desinfectante-multiuso-citrico",
    name: "Desinfectante Multiuso Aroma Cítrico",
    categoryId: "desinfectantes",
    description:
      "Desinfectante de uso general con fragancia cítrica, ideal para dejar ambientes limpios y frescos.",
    presentation: "Galón 4 L",
    recommendedUse:
      "Limpieza y desinfección diaria de pisos, mostradores y áreas de atención al cliente.",
  },
  {
    id: "amonio-cuaternario-concentrado",
    name: "Amonio Cuaternario Concentrado",
    categoryId: "desinfectantes",
    description:
      "Desinfectante concentrado de amplio espectro para uso en cocinas industriales y áreas clínicas.",
    presentation: "Galón 4 L",
    recommendedUse:
      "Desinfección de superficies en cocinas industriales, clínicas y áreas de alto riesgo sanitario.",
  },
  {
    id: "gel-antibacterial-70",
    name: "Gel Antibacterial 70%",
    categoryId: "desinfectantes",
    description:
      "Gel antibacterial de rápida absorción para la higienización frecuente de manos del personal.",
    presentation: "Galón 3.8 L",
    recommendedUse:
      "Higienización de manos del personal y clientes en puntos de atención y acceso.",
  },

  // Desengrasantes
  {
    id: "desengrasante-industrial-concentrado",
    name: "Desengrasante Industrial Concentrado",
    categoryId: "desengrasantes",
    description:
      "Fórmula concentrada de alto poder para remover grasa acumulada en superficies industriales.",
    presentation: "Galón 4 L",
    recommendedUse:
      "Limpieza de campanas extractoras, filtros y superficies con grasa endurecida.",
  },
  {
    id: "desengrasante-cocinas-industriales",
    name: "Desengrasante para Cocinas Industriales",
    categoryId: "desengrasantes",
    description:
      "Desengrasante especializado para el uso diario en cocinas de restaurantes y hoteles.",
    presentation: "Galón 4 L",
    recommendedUse:
      "Limpieza diaria de planchas, cocinas y superficies de acero inoxidable.",
  },
  {
    id: "desengrasante-multiuso-biodegradable",
    name: "Desengrasante Multiuso Biodegradable",
    categoryId: "desengrasantes",
    description:
      "Desengrasante de origen biodegradable, apto para negocios con políticas ambientales.",
    presentation: "Galón 4 L",
    recommendedUse:
      "Limpieza general de grasa en pisos, mesones y superficies de uso frecuente.",
  },
  {
    id: "removedor-grasa-quemada-parrillas",
    name: "Removedor de Grasa Quemada para Parrillas",
    categoryId: "desengrasantes",
    description:
      "Producto de alta potencia formulado para remover grasa quemada y carbonizada en parrillas.",
    presentation: "Galón 4 L",
    recommendedUse:
      "Limpieza profunda de parrillas, planchas y equipos de cocción a altas temperaturas.",
  },
  {
    id: "desengrasante-alcalino-pisos-industriales",
    name: "Desengrasante Alcalino para Pisos Industriales",
    categoryId: "desengrasantes",
    description:
      "Desengrasante alcalino diseñado para pisos industriales con acumulación constante de grasa.",
    presentation: "Bidón 20 L",
    recommendedUse:
      "Limpieza de pisos en cocinas industriales y plantas de producción de alimentos.",
  },

  // Papel
  {
    id: "papel-higienico-institucional-jumbo",
    name: "Papel Higiénico Institucional Jumbo",
    categoryId: "papel",
    description:
      "Papel higiénico en formato jumbo de alta duración, ideal para baños de alto tránsito.",
    presentation: "Caja x 12 rollos",
    recommendedUse:
      "Abastecimiento de baños en oficinas, restaurantes y establecimientos comerciales.",
  },
  {
    id: "toallas-papel-interfoliadas",
    name: "Toallas de Papel Interfoliadas",
    categoryId: "papel",
    description:
      "Toallas de manos interfoliadas de secado rápido, para dispensadores institucionales.",
    presentation: "Caja x 20 paquetes",
    recommendedUse:
      "Secado de manos en baños y áreas de lavado en cocinas y establecimientos comerciales.",
  },
  {
    id: "papel-higienico-doble-hoja",
    name: "Papel Higiénico Doble Hoja",
    categoryId: "papel",
    description:
      "Papel higiénico de doble hoja para un uso más suave en baños de atención al público.",
    presentation: "Paquete x 4 rollos",
    recommendedUse: "Uso diario en baños de oficinas, hoteles y locales comerciales.",
  },
  {
    id: "servilletas-institucionales",
    name: "Servilletas Institucionales",
    categoryId: "papel",
    description:
      "Servilletas de papel para uso institucional en comedores y áreas de servicio de alimentos.",
    presentation: "Paquete x 500 unidades",
    recommendedUse: "Servicio de mesas en restaurantes, comedores y cafeterías.",
  },
  {
    id: "toallas-manos-rollo-bobina",
    name: "Toallas de Manos en Rollo (Bobina)",
    categoryId: "papel",
    description:
      "Bobina de papel para dispensadores de pared, con alta capacidad de rendimiento.",
    presentation: "Caja x 6 rollos",
    recommendedUse: "Secado de manos en baños de alto tránsito con dispensador de bobina.",
  },

  // Herramientas de Limpieza
  {
    id: "trapeador-industrial-microfibra",
    name: "Trapeador Industrial de Microfibra",
    categoryId: "herramientas-limpieza",
    description:
      "Trapeador de microfibra de alta absorción, resistente al uso intensivo diario.",
    presentation: "Unidad",
    recommendedUse: "Limpieza de pisos en áreas comerciales e industriales de alto tránsito.",
  },
  {
    id: "escoba-industrial-cerdas-duras",
    name: "Escoba Industrial de Cerdas Duras",
    categoryId: "herramientas-limpieza",
    description:
      "Escoba de cerdas duras para barrido de residuos en áreas exteriores e interiores.",
    presentation: "Unidad",
    recommendedUse: "Barrido de patios, bodegas y áreas de carga y descarga.",
  },
  {
    id: "carro-limpieza-balde-exprimidor",
    name: "Carro de Limpieza con Balde Exprimidor",
    categoryId: "herramientas-limpieza",
    description:
      "Carro de limpieza con balde exprimidor doble, pensado para rondas de limpieza continuas.",
    presentation: "Unidad",
    recommendedUse: "Rondas de limpieza en hoteles, centros comerciales y oficinas.",
  },
  {
    id: "set-panos-microfibra",
    name: "Set de Paños de Microfibra",
    categoryId: "herramientas-limpieza",
    description:
      "Set de paños de microfibra reutilizables para limpieza general de superficies.",
    presentation: "Paquete x 10 unidades",
    recommendedUse: "Limpieza de mesones, vidrios y superficies delicadas.",
  },
  {
    id: "recogedor-basura-mango-largo",
    name: "Recogedor de Basura con Mango Largo",
    categoryId: "herramientas-limpieza",
    description:
      "Recogedor de basura ergonómico con mango largo para reducir el esfuerzo durante la limpieza.",
    presentation: "Unidad",
    recommendedUse: "Recolección de residuos en pisos de oficinas, tiendas y áreas comunes.",
  },

  // Fundas de Basura
  {
    id: "fundas-basura-industriales-negras-30gal",
    name: "Fundas de Basura Industriales Negras 30 Gal",
    categoryId: "fundas-basura",
    description:
      "Fundas de basura resistentes para el manejo diario de desechos en negocios comerciales.",
    presentation: "Paquete x 25 unidades",
    recommendedUse: "Recolección de desechos comunes en oficinas, tiendas y restaurantes.",
  },
  {
    id: "fundas-basura-reforzadas-55gal",
    name: "Fundas de Basura Reforzadas 55 Gal",
    categoryId: "fundas-basura",
    description:
      "Fundas reforzadas de alta capacidad para desechos de mayor volumen o peso.",
    presentation: "Paquete x 10 unidades",
    recommendedUse: "Manejo de desechos voluminosos en cocinas industriales y bodegas.",
  },
  {
    id: "fundas-basura-biodegradables-20gal",
    name: "Fundas de Basura Biodegradables 20 Gal",
    categoryId: "fundas-basura",
    description:
      "Fundas biodegradables para negocios con compromisos de responsabilidad ambiental.",
    presentation: "Paquete x 25 unidades",
    recommendedUse: "Recolección de desechos comunes con menor impacto ambiental.",
  },
  {
    id: "fundas-basura-riesgo-biologico",
    name: "Fundas de Basura para Riesgo Biológico",
    categoryId: "fundas-basura",
    description:
      "Fundas rojas identificadas para el manejo de desechos con riesgo biológico en clínicas.",
    presentation: "Paquete x 25 unidades",
    recommendedUse: "Disposición de desechos biológicos en clínicas y centros de salud.",
  },
  {
    id: "fundas-basura-transparentes-30gal",
    name: "Fundas de Basura Transparentes 30 Gal",
    categoryId: "fundas-basura",
    description:
      "Fundas transparentes que facilitan la identificación visual del contenido para reciclaje.",
    presentation: "Paquete x 25 unidades",
    recommendedUse: "Programas de reciclaje y separación de residuos en oficinas e instituciones.",
  },

  // Insumos para Baño
  {
    id: "jabon-liquido-manos-espumoso",
    name: "Jabón Líquido para Manos Espumoso",
    categoryId: "insumos-bano",
    description:
      "Jabón líquido espumoso para dispensadores, con fórmula suave para uso frecuente.",
    presentation: "Galón 3.8 L",
    recommendedUse: "Lavado de manos en baños de oficinas, restaurantes y locales comerciales.",
  },
  {
    id: "dispensador-jabon-liquido",
    name: "Dispensador de Jabón Líquido",
    categoryId: "insumos-bano",
    description:
      "Dispensador de pared de fácil recarga para jabón líquido en baños institucionales.",
    presentation: "Unidad",
    recommendedUse: "Instalación en baños de oficinas, hoteles y establecimientos comerciales.",
  },
  {
    id: "pastillas-desodorizantes-urinario",
    name: "Pastillas Desodorizantes para Urinario",
    categoryId: "insumos-bano",
    description:
      "Pastillas desodorizantes que controlan olores y ayudan a mantener limpios los urinarios.",
    presentation: "Caja x 12 unidades",
    recommendedUse: "Control de olores en urinarios de baños públicos y comerciales.",
  },
  {
    id: "limpiador-desincrustante-inodoros",
    name: "Limpiador Desincrustante para Inodoros",
    categoryId: "insumos-bano",
    description:
      "Limpiador especializado para remover sarro e incrustaciones en inodoros y urinarios.",
    presentation: "Galón 4 L",
    recommendedUse: "Limpieza profunda de inodoros y urinarios en baños de alto tránsito.",
  },
  {
    id: "ambientador-aerosol-banos",
    name: "Ambientador en Aerosol para Baños",
    categoryId: "insumos-bano",
    description:
      "Ambientador en aerosol de larga duración para mantener los baños con un aroma agradable.",
    presentation: "Unidad 400 ml",
    recommendedUse: "Control de olores en baños de oficinas, hoteles y locales comerciales.",
  },

  // Limpieza Industrial
  {
    id: "limpiador-alcalino-pisos-industriales",
    name: "Limpiador Alcalino para Pisos Industriales",
    categoryId: "limpieza-industrial",
    description:
      "Limpiador alcalino de alto rendimiento para pisos con suciedad industrial acumulada.",
    presentation: "Bidón 20 L",
    recommendedUse: "Limpieza de pisos en plantas industriales y bodegas de alto tránsito.",
  },
  {
    id: "desincrustante-acido-superficies-industriales",
    name: "Desincrustante Ácido para Superficies Industriales",
    categoryId: "limpieza-industrial",
    description:
      "Desincrustante de fórmula ácida para remover sarro y residuos minerales en superficies duras.",
    presentation: "Galón 4 L",
    recommendedUse: "Remoción de sarro en superficies industriales y equipos de producción.",
  },
  {
    id: "cera-selladora-pisos",
    name: "Cera Selladora para Pisos",
    categoryId: "limpieza-industrial",
    description:
      "Cera selladora que protege y da brillo a pisos de alto tránsito comercial e industrial.",
    presentation: "Galón 4 L",
    recommendedUse: "Sellado y mantenimiento de brillo en pisos de cerámica y porcelanato.",
  },
  {
    id: "detergente-industrial-polvo",
    name: "Detergente Industrial en Polvo",
    categoryId: "limpieza-industrial",
    description:
      "Detergente en polvo de uso industrial para limpieza general de gran volumen.",
    presentation: "Saco 25 kg",
    recommendedUse: "Limpieza de textiles, uniformes y superficies en operaciones a gran escala.",
  },
  {
    id: "limpiador-alto-poder-maquinaria",
    name: "Limpiador de Alto Poder para Maquinaria",
    categoryId: "limpieza-industrial",
    description:
      "Limpiador de alta concentración diseñado para maquinaria y equipos de producción.",
    presentation: "Galón 4 L",
    recommendedUse: "Limpieza y mantenimiento de maquinaria en plantas de producción.",
  },

  // Higiene Personal
  {
    id: "jabon-barra-institucional",
    name: "Jabón en Barra Institucional",
    categoryId: "higiene-personal",
    description:
      "Jabón en barra de uso institucional para el aseo personal del personal y clientes.",
    presentation: "Paquete x 24 unidades",
    recommendedUse: "Abastecimiento de baños de personal en cocinas y áreas de producción.",
  },
  {
    id: "shampoo-corporal-dispensador",
    name: "Shampoo Corporal para Dispensador",
    categoryId: "higiene-personal",
    description:
      "Shampoo corporal de uso general para dispensadores en vestidores y duchas de personal.",
    presentation: "Galón 3.8 L",
    recommendedUse: "Vestidores y duchas de personal en hoteles y plantas de producción.",
  },
  {
    id: "toallas-humedas-desinfectantes",
    name: "Toallas Húmedas Desinfectantes",
    categoryId: "higiene-personal",
    description:
      "Toallas húmedas listas para usar, ideales para la desinfección rápida de manos y superficies.",
    presentation: "Paquete x 80 unidades",
    recommendedUse: "Desinfección rápida de manos y superficies en puntos de atención.",
  },
  {
    id: "alcohol-gel-manos",
    name: "Alcohol en Gel para Manos",
    categoryId: "higiene-personal",
    description:
      "Alcohol en gel de bolsillo para la higienización frecuente de manos del personal.",
    presentation: "Botella 500 ml",
    recommendedUse: "Higienización de manos en puntos de atención al cliente y áreas comunes.",
  },
  {
    id: "dispensador-alcohol-gel-pared",
    name: "Dispensador de Alcohol en Gel de Pared",
    categoryId: "higiene-personal",
    description:
      "Dispensador de pared para alcohol en gel, de fácil instalación en accesos y pasillos.",
    presentation: "Unidad",
    recommendedUse: "Instalación en accesos de oficinas, restaurantes y locales comerciales.",
  },

  // Equipos de Protección
  {
    id: "guantes-nitrilo-desechables",
    name: "Guantes de Nitrilo Desechables",
    categoryId: "equipos-proteccion",
    description:
      "Guantes de nitrilo resistentes a químicos, ideales para tareas de limpieza y cocina.",
    presentation: "Caja x 100 unidades",
    recommendedUse: "Manipulación de químicos de limpieza y preparación de alimentos.",
  },
  {
    id: "guantes-latex-limpieza",
    name: "Guantes de Látex para Limpieza",
    categoryId: "equipos-proteccion",
    description:
      "Guantes de látex resistentes y flexibles para labores de limpieza y desinfección.",
    presentation: "Caja x 100 unidades",
    recommendedUse: "Tareas generales de limpieza y desinfección en cocinas y baños.",
  },
  {
    id: "mandil-industrial-cocina",
    name: "Mandil Industrial para Cocina",
    categoryId: "equipos-proteccion",
    description:
      "Mandil resistente a líquidos y grasa, diseñado para el personal de cocinas industriales.",
    presentation: "Unidad",
    recommendedUse: "Protección del personal en cocinas industriales y áreas de producción.",
  },
  {
    id: "mascarillas-desechables-proteccion",
    name: "Mascarillas Desechables de Protección",
    categoryId: "equipos-proteccion",
    description:
      "Mascarillas desechables de triple capa para protección del personal en el trabajo diario.",
    presentation: "Caja x 50 unidades",
    recommendedUse: "Uso diario del personal en cocinas, clínicas y atención al público.",
  },
  {
    id: "botas-caucho-antideslizantes",
    name: "Botas de Caucho Antideslizantes",
    categoryId: "equipos-proteccion",
    description:
      "Botas de caucho con suela antideslizante para pisos húmedos en cocinas y áreas de limpieza.",
    presentation: "Par",
    recommendedUse: "Protección del personal en cocinas industriales y zonas de lavado.",
  },
]
