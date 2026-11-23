import { Product } from '../types/ecommerce';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-sunset-lamp',
    title: 'Smart LED Sunset Projection Lamp',
    titleAr: 'أباجورة إضاءة غروب الشمس الذكية 16 لون مع ريموت كنترول',
    description: 'حوّل غرفتك إلى ستوديو تصوير فوتوغرافي ساحر بضغطة زر. أباجورة غروب الشمس الأصلية بألوان RGB المتعددة، ممتازة لصناع المحتوى والريلز وأجواء الاسترخاء الهادئة.',
    descriptionAr: 'الأباجورة الأكثر مبيعاً على تيك توك وإنستجرام! تمنحك إضاءة غروب شمس دافئة وطبيعية بزاوية دوران 360 درجة، مع ريموت تحكم لتغيير 16 لون مختلف و4 أوضاع إضاءة ديناميكية وتعديل درجة السطوع.',
    category: 'gadgets',
    categoryAr: 'أدوات ذكية وتريند',
    taagerPrice: 145,       // سعر التكلفة من تاجر
    sellingPrice: 285,      // سعر البيع للعميل (ربح 140 ج.م)
    originalPrice: 390,     // السعر القديم
    stock: 24,
    sku: 'TG-SUNSET-16C',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewsCount: 142,
    features: [
      'عدسة كريستال نقية عالية النفاذية لإسقاط ضوئي واضح ومبهر',
      '16 لوناً مختلفاً تشمل ألوان الغروب الذهبي والأرجواني وأضواء قوس قزح',
      'رأس معدني يدور بزاوية 360 درجة لتوجيه الإضاءة للجدار أو السقف',
      'تعمل بكابل USB مع مفتاح تحكم مدمج + ريموت كنترول لاسلكي',
      'قاعدة حديدية صلبة مانعة للانزلاق لثبات فائق'
    ],
    specifications: {
      'الخامة': 'ألومنيوم مقوى + عدسة بصرية أكريليك',
      'مصدر الطاقة': 'USB 5V (شاحن الموبايل أو الباوربانك)',
      'طول الكابل': '1.5 متر مع زر تشغيل',
      'التحكم': 'ريموت كنترول 24 زر + أزرار بالسلك'
    },
    isFeatured: true,
    isDeal: true,
    dealBadge: 'وفر 105 ج.م • تريند التيك توك',
    createdAt: '2025-01-10T12:00:00Z',
    isActive: true
  },
  {
    id: 'prod-garment-steamer',
    title: 'Portable Handheld Foldable Garment Steamer',
    titleAr: 'مكواة البخار المحمولة القابلة للطي للملابس والسفر',
    description: 'تخلص من كرمشة وتجاعيد الملابس في 30 ثانية بدون طاولة كوي! مكواة بخار خفيفة الوزن وقابلة للطي، مثالية للاستخدام اليومي والسفر والمناسبات السريعة.',
    descriptionAr: 'المكواة البخارية السحرية التي تحمي أقمشتك الحساسة كالحرير والشيفون والبدل الرسمية من الحرق، مع قوة بخار تقتل 99% من البكتيريا وتزيل الروائح الكريهة فورياً.',
    category: 'home',
    categoryAr: 'المنزل والمطبخ',
    taagerPrice: 260,       // تكلفة تاجر
    sellingPrice: 440,      // سعر البيع (ربح 180 ج.م)
    originalPrice: 580,
    stock: 18,
    sku: 'TG-STEAM-FOLD-PRO',
    images: [
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewsCount: 98,
    features: [
      'تسخين سريع جداً وجاهزية لضخ البخار خلال 20 ثانية فقط',
      'تصميم قابل للطي يوفر المساحة ويسهل وضعه في حقيبة السفر',
      'خزان مياه شفاف قابل للفك بسعة 150 مل يكفي لكوي 3-4 قطع متتالية',
      'لوح من الستانلس ستيل المقاوم للصدأ لحماية أدق الأقمشة',
      'نظام أمان ذكي يغلق تلقائياً عند نفاد المياه'
    ],
    specifications: {
      'القدرة الكهربائية': '1000 واط قوة فائقة',
      'الجهد': '220 فولت (كهرباء مصر)',
      'سعة الخزان': '150 مل',
      'الوزن': '650 جرام خفيفة ومريحة لليد'
    },
    isFeatured: true,
    isDeal: true,
    dealBadge: 'الأكثر مبيعاً • خصم 24%',
    createdAt: '2025-01-12T10:00:00Z',
    isActive: true
  },
  {
    id: 'prod-wireless-chopper',
    title: 'Rechargeable Mini Electric Food Chopper & Garlic Crusher',
    titleAr: 'مفرمة الثوم والخضار اللاسلكية الذكية القابلة للشحن',
    description: 'وداعاً لرائحة الثوم والدموع أثناء تقطيع البصل! مفرمة كهربائية محمولة تعمل بالشحن تفرم الثوم، البصل، الفلفل، المكسرات ولحوم الأطفال في 5 ثوانٍ.',
    descriptionAr: 'أداة مطبخ أساسية لكل ست بيت وعروسة! صغيرة الحجم لكن بقوة هائلة، شفرات ثلاثية من الفولاذ المقاوم للصدأ، تشحن بالـ USB وتعمل لأكثر من 30 استخدام للشحنة الواحدة.',
    category: 'home',
    categoryAr: 'المنزل والمطبخ',
    taagerPrice: 110,
    sellingPrice: 220,      // ربح 110 ج.م
    originalPrice: 320,
    stock: 45,
    sku: 'TG-CHOPPER-USB250',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewsCount: 215,
    features: [
      'فرم فوري ناعم أو خشن بضغطة زر علوية واحدة',
      'شفرات ثلاثية 3D حادة جداً مصنوعة من ستانلس ستيل 304 الغذائي',
      'مقاومة للماء بالكامل وسهلة التنظيف تحت الصنبور مباشرة',
      'بطارية ليثيوم مدمجة تشحن بوصلة Type-C في ساعة واحدة',
      'وعاء أمان عالي الجودة خالٍ تماماً من مادة BPA الضارة'
    ],
    specifications: {
      'السعة': '250 مل',
      'البطارية': '1200 مللي أمبير قابلة للشحن',
      'عدد الشفرات': '3 شفرات فولاذية دوارة',
      'مستوى الأمان': 'إغلاق مغناطيسي ذكي'
    },
    isFeatured: true,
    isDeal: false,
    dealBadge: 'وفّر 100 ج.م • طلب عالي',
    createdAt: '2025-01-14T09:30:00Z',
    isActive: true
  },
  {
    id: 'prod-car-vacuum',
    title: '2-in-1 High Power Cordless Car Vacuum & Air Duster',
    titleAr: 'مكنسة ومنفاخ السيارة اللاسلكية 2 في 1 قوة شفط إعصارية',
    description: 'حافظ على نظافة سيارتك ومكتبك طوال الوقت دون الحاجة لمغاسل السيارات. مكنسة لاسلكية تجمع بين الشفط القوي ونفخ الأتربة للأماكن الضيقة.',
    descriptionAr: 'قوة شفط توربينية مذهلة تسحب الأتربة وبقايا الطعام والشعر من فرش السيارة، الكيبورد وزوايا الكنب بسهولة، مع ملحقات متعددة وفلتر قابل للغسيل وإعادة الاستخدام.',
    category: 'car',
    categoryAr: 'إكسسوارات السيارات',
    taagerPrice: 195,
    sellingPrice: 360,      // ربح 165 ج.م
    originalPrice: 480,
    stock: 19,
    sku: 'TG-VAC-2IN1-PRO',
    images: [
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6,
    reviewsCount: 84,
    features: [
      'وظيفتين في جهاز واحد: شفط قوي من الأمام + طرد ونفخ هواء من الخلف',
      'فلتر HEPA عالي الدقة يلتقط أدق ذرات الغبار وقابل للغسيل',
      'بطارية تدوم حتى 30 دقيقة من العمل المتواصل للشحنة الواحدة',
      'تأتي مع 3 رؤوس مختلفة: فرشاة شعر، فوهة شقوق رفيعة، وفوهة نفخ',
      'تصميم مريح وخفيف يسهل تخزينه في درج السيارة أو الباب'
    ],
    specifications: {
      'قوة الشفط': '9000 باسكال توربو',
      'سعة البطارية': '2000 مللي أمبير مزدوجة',
      'نوع الشحن': 'USB سريع',
      'الوزن': '350 جرام'
    },
    isFeatured: true,
    isDeal: true,
    dealBadge: 'عرض التوفير للسيارة • خصم 25%',
    createdAt: '2025-01-15T15:00:00Z',
    isActive: true
  },
  {
    id: 'prod-wireless-earbuds',
    title: 'TWS Noise Cancelling Bluetooth Wireless Earbuds',
    titleAr: 'سماعات بلوتوث لاسلكية عازلة للضوضاء مع شاشة رقمية للبطارية',
    description: 'تجربة صوتية نقية بتقنية Bass عميق وعزل ذكي للضوضاء الخارجية للمكالمات والألعاب والموسيقى. تصميم مريح ومقاوم للتعرق مع علبة شحن بشاشة LED.',
    descriptionAr: 'سماعة عملية جداً وبمظهر أنيق تنافس السماعات الغالية. شاشة LED توضح نسبة شحن كل سماعة بدقة، مايكروفون نقي جداً للمكالمات في الشارع، واقتران فوري عبر بلوتوث 5.3 الحديث.',
    category: 'electronics',
    categoryAr: 'إلكترونيات وإكسسوارات',
    taagerPrice: 135,
    sellingPrice: 260,      // ربح 125 ج.م
    originalPrice: 370,
    stock: 32,
    sku: 'TG-TWS-AIR-PRO',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewsCount: 310,
    features: [
      'بلوتوث إصدار 5.3 لسرعة نقل بيانات فائقة واستقرار بدون تقطيع',
      'شاشة عرض رقمية ذكية توضح نسبة شحن الباور بنك وكل سماعة',
      'مايكروفون HD مدمج لعزل الضوضاء أثناء المكالمات والاجتماعات',
      'تحكم كامل باللمس الذكي لتغيير الأغاني والرد على المكالمات',
      'مقاومة لرذاذ الماء والعرق بمعيار IPX5 مثالية للرياضة والجيم'
    ],
    specifications: {
      'مدى الاتصال': '10 أمتار بدون عوائق',
      'وقت التشغيل': '5 إلى 6 ساعات متواصلة',
      'وقت الشحن': '1 ساعة فقط',
      'سعة العلبة': '300 مللي أمبير تكفي 4 شحنات'
    },
    isFeatured: true,
    isDeal: false,
    dealBadge: 'الأعلى تقييماً ★ 4.8',
    createdAt: '2025-01-16T18:00:00Z',
    isActive: true
  },
  {
    id: 'prod-vintage-trimmer',
    title: 'Professional Vintage T9 Hair & Beard Trimmer',
    titleAr: 'ماكينة الحلاقة والتشذيب الاحترافية فينتاج T9 الذهبية للشعر والذقن',
    description: 'الماكينة الأشهر في مصر والوطن العربي لنحت وتحديد الذقن والشعر بدقة الصالونات الاحترافية. شفرة من التيتانيوم المقاوم للصدأ ومحرك نحاسي قوي.',
    descriptionAr: 'شفرة T حادة ودقيقة جداً تسمح بالتحديد حتى الصفر دون التسبب في حساسية أو جروح للجلد. هيكل معدني منقوش فخم ومقاوم للصدمات مع 4 أمشاط مدرجة لجميع الأطوال.',
    category: 'beauty',
    categoryAr: 'العناية والصحة',
    taagerPrice: 125,
    sellingPrice: 245,      // ربح 120 ج.م
    originalPrice: 340,
    stock: 28,
    sku: 'TG-T9-VINTAGE-GOLD',
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewsCount: 178,
    features: [
      'شفرة حلاقة على شكل حرف T دقيقة بدرجة صفر لتحديد الشعر واللحية بدقة',
      'محرك قلب نحاسي قوي وعالي السرعة مع صوت هادئ ومريح',
      'هيكل معدني كلاسيكي منقوش بالليزر مقاوم للتآكل ومريح في قبضة اليد',
      'بطارية ليثيوم تدوم حتى ساعتين متواصلتين مع شحن USB سريع',
      'تتضمن 4 أمشاط قياس (1.5 مم، 2 مم، 3 مم، 4 مم) + فرشاة وزيت تنظيف'
    ],
    specifications: {
      'مادة الشفرة': 'تيتانيوم وسيراميك كربوني',
      'وقت الشحن': 'ساعتان',
      'وقت الاستخدام': '120 دقيقة كاملة',
      'الملحقات': '4 أمشاط + شاحن USB + فرشاة'
    },
    isFeatured: false,
    isDeal: true,
    dealBadge: 'وفر 95 ج.م • ضمان استبدال',
    createdAt: '2025-01-18T11:00:00Z',
    isActive: true
  },
  {
    id: 'prod-water-dispenser',
    title: 'Automatic USB Rechargeable Drinking Water Pump',
    titleAr: 'مضخة مياه القارورة الكهربائية الأوتوماتيكية القابلة للشحن',
    description: 'ارتاح من رفع وحمل قوارير المياه الثقيلة! مضخة ذكية تركب على أي قارورة مياه وتضخ الماء بلمسة زر واحدة. ممتازة للمنزل والمكتب والرحلات.',
    descriptionAr: 'لا مزيد من المعاناة مع قوارير المياه الكبيرة؛ هذه المضخة الكهربائية الصامتة تسحب المياه بنقاء وسرعة فائقة بضغطة زر واحدة. أنبوب سيليكون غذائي آمن وصحي 100%.',
    category: 'home',
    categoryAr: 'المنزل والمطبخ',
    taagerPrice: 85,
    sellingPrice: 175,      // ربح 90 ج.م
    originalPrice: 250,
    stock: 50,
    sku: 'TG-WATER-PUMP-USB',
    images: [
      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6,
    reviewsCount: 165,
    features: [
      'ضخ سريع للماء يصل إلى 1.5 لتر في الدقيقة بضغطة زر',
      'خرطوم سيليكون مرن ومعتمد غذائياً خالٍ من الروائح والمواد الكيميائية',
      'صنبور مصنوع من الاستانلس ستيل 304 المقاوم للصدأ والتآكل',
      'شحنة واحدة عبر USB تكفي لضخ من 4 إلى 6 قوارير مياه كبيرة',
      'متوافقة مع جميع أحجام القوارير المتداولة في مصر (11 و 19 لتر)'
    ],
    specifications: {
      'البطارية': '1200 مللي أمبير USB',
      'الخامة': 'ABS غذائي متين + أنبوب سيليكون',
      'مفتاح التحكم': 'زر إلكتروني ناعم مع إضاءة LED'
    },
    isFeatured: false,
    isDeal: false,
    dealBadge: 'عملي جداً للمطبخ',
    createdAt: '2025-01-20T14:00:00Z',
    isActive: true
  },
  {
    id: 'prod-auto-car-mount',
    title: 'Smart Automatic Sensor Car Wireless Fast Charger & Phone Holder',
    titleAr: 'حامل ومثبت الهاتف الذكي للسيارة مع حساس حركة وشاحن لاسلكي سريع',
    description: 'يفتح ويغلق تلقائياً بحساس ذكي عند اقتراب هاتفك! شاحن لاسلكي سريع يثبت الموبايل بثبات عالي حتى على المطبات القوية والطرق غير الممهدة.',
    descriptionAr: 'تجربة قيادة ذكية وآمنة؛ يفتح الذراعان أوتوماتيكياً بالأشعة تحت الحمراء عند تقريب الهاتف ويغلقان بقوة وأمان. شحن سريع بتقنية Qi متوافق مع الآيفون وسامسونج وكافة الهواتف.',
    category: 'car',
    categoryAr: 'إكسسوارات السيارات',
    taagerPrice: 170,
    sellingPrice: 320,      // ربح 150 ج.م
    originalPrice: 440,
    stock: 22,
    sku: 'TG-MOUNT-SENSOR-QI',
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewsCount: 112,
    features: [
      'مستشعر ذكي بالأشعة تحت الحمراء يفتح ويغلق الذراعين أوتوماتيكياً',
      'شحن لاسلكي سريع بقدرة تصل إلى 15 واط مع حماية من الحرارة الزائدة',
      'دوران 360 درجة لاستخدام الموبايل بالطول أو بالعرض للـ GPS والخرائط',
      'قفل مغناطيسي سيليكوني مبطن يحمي هاتفك من الخدوش والاهتزاز',
      'يعمل بزر لمس خلفي لفتح الحامل وسحب الهاتف بيد واحدة بسهولة'
    ],
    specifications: {
      'قوة الشحن': '15W / 10W / 7.5W أوتوماتيكي',
      'التثبيت': 'على فتحات تكييف السيارة أو التابلوه',
      'التوافق': 'جميع الهواتف من 4.7 إلى 6.9 بوصة'
    },
    isFeatured: true,
    isDeal: true,
    dealBadge: 'وفر 120 ج.م • تريند السائقين',
    createdAt: '2025-01-22T08:00:00Z',
    isActive: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: '#DK-1001',
    customerName: 'أحمد محمود القاضي',
    customerPhone: '01012345678',
    governorate: 'cairo',
    city: 'مدينة نصر',
    address: 'شارع عباس العقاد - عمارة 45 - الدور الثالث شقة 6',
    notes: 'برجاء الاتصال قبل التوصيل بنصف ساعة',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        price: 285,
        taagerCost: 145
      }
    ],
    subtotal: 285,
    shippingCost: 45,
    total: 330,
    totalTaagerCost: 145,
    estimatedProfit: 140,
    paymentMethod: 'cod' as const,
    status: 'delivered' as const,
    statusHistory: [
      { status: 'pending' as const, timestamp: '2025-02-10T10:00:00Z', note: 'تم استلام الطلب من المتجر' },
      { status: 'confirmed' as const, timestamp: '2025-02-10T11:30:00Z', note: 'تم التأكيد مع العميل هاتفياً' },
      { status: 'processing' as const, timestamp: '2025-02-10T13:00:00Z', note: 'تم إرسال الطلب لتاجر للشحن' },
      { status: 'shipped' as const, timestamp: '2025-02-11T09:00:00Z', note: 'خرج مع مندوب شركة الشحن' },
      { status: 'delivered' as const, timestamp: '2025-02-12T16:20:00Z', note: 'تم التسليم واستلام المبلغ 330 ج.م' }
    ],
    createdAt: '2025-02-10T10:00:00Z'
  },
  {
    id: '#DK-1002',
    customerName: 'سارة عبد الرحمن',
    customerPhone: '01198765432',
    governorate: 'giza',
    city: 'الدقي',
    address: 'شارع مصدق - أمام بنك مصر - برج النيل',
    notes: 'الدفع عند الاستلام كاش',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        price: 440,
        taagerCost: 260
      }
    ],
    subtotal: 440,
    shippingCost: 45,
    total: 485,
    totalTaagerCost: 260,
    estimatedProfit: 180,
    paymentMethod: 'cod' as const,
    status: 'shipped' as const,
    statusHistory: [
      { status: 'pending' as const, timestamp: '2025-02-12T14:10:00Z', note: 'تم استلام الطلب' },
      { status: 'confirmed' as const, timestamp: '2025-02-12T15:00:00Z', note: 'تم تأكيد المقاس والعنوان' },
      { status: 'processing' as const, timestamp: '2025-02-12T18:00:00Z', note: 'جاري التجهيز مع تاجر' },
      { status: 'shipped' as const, timestamp: '2025-02-13T10:15:00Z', note: 'تم تسليم الشحنة لمندوب بوسطة' }
    ],
    createdAt: '2025-02-12T14:10:00Z'
  },
  {
    id: '#DK-1003',
    customerName: 'محمد طارق الباز',
    customerPhone: '01234567890',
    governorate: 'alexandria',
    city: 'سيدي جابر',
    address: 'طريق الجيش - عمارات ضباط مصطفى كامل',
    notes: 'متاح الاستلام بعد الساعة 3 عصراً',
    items: [
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1,
        price: 360,
        taagerCost: 195
      },
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        price: 260,
        taagerCost: 135
      }
    ],
    subtotal: 620,
    shippingCost: 55,
    total: 675,
    totalTaagerCost: 330,
    estimatedProfit: 290,
    paymentMethod: 'cod' as const,
    status: 'confirmed' as const,
    statusHistory: [
      { status: 'pending' as const, timestamp: '2025-02-13T09:40:00Z', note: 'طلب جديد عبر المتجر' },
      { status: 'confirmed' as const, timestamp: '2025-02-13T11:00:00Z', note: 'تم التأكيد وجاري إدخال الطلب على تاجر' }
    ],
    createdAt: '2025-02-13T09:40:00Z'
  },
  {
    id: '#DK-1004',
    customerName: 'هدى مصطفى الشريف',
    customerPhone: '01567890123',
    governorate: 'daqahliya',
    city: 'المنصورة',
    address: 'شارع المشاية السفلية - خلف نادي الجزيرة',
    notes: '',
    items: [
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 2,
        price: 220,
        taagerCost: 110
      }
    ],
    subtotal: 440,
    shippingCost: 60,
    total: 500,
    totalTaagerCost: 220,
    estimatedProfit: 220,
    paymentMethod: 'cod' as const,
    status: 'pending' as const,
    statusHistory: [
      { status: 'pending' as const, timestamp: '2025-02-13T16:00:00Z', note: 'طلب قيد المراجعة والتأكيد' }
    ],
    createdAt: '2025-02-13T16:00:00Z'
  }
];
