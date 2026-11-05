/**
 * discoverData.ts — بيانات قسم "اكتشف ما حولك"
 *
 * البنية مصمَّمة لتكون:
 * - قابلة للتوسع: أضف عالماً جديداً بإضافة كائن واحد في DISCOVER_WORLDS
 * - مستقلة: لا تعتمد على أي بيانات من أقسام أخرى
 * - غنية: كل عنصر له اسم عربي + إنجليزي + إيموجي + وصف اختياري
 */

// ——— نوع العنصر الواحد ———
export interface DiscoverItem {
  id: string
  nameAr: string
  nameEn: string
  emoji: string
  descAr?: string
  descEn?: string
  color?: string
}

// ——— نوع العالم ———
export interface DiscoverWorld {
  id: string
  titleAr: string
  titleEn: string
  emoji: string
  color: string
  colorEnd: string
  sceneEmojis: string[]
  items: DiscoverItem[]
}

// ════════════════════════════════════════════════
// ——— بيانات العوالم ———
// ════════════════════════════════════════════════
export const DISCOVER_WORLDS: DiscoverWorld[] = [

  // ——— 🏠 اكتشف البيت ———
  {
    id: 'home',
    titleAr: 'اكْتَشِفِ الْبَيْتَ',
    titleEn: 'Discover the Home',
    emoji: '🏠',
    color: '#ff9f45',
    colorEnd: '#e85d75',
    sceneEmojis: ['🏠', '🪴', '🌅', '✨'],
    items: [
      { id: 'door',   nameAr: 'بَابٌ',    nameEn: 'Door',         emoji: '🚪', descAr: 'يُفتح ويُغلق', descEn: 'Opens and closes' },
      { id: 'window', nameAr: 'نَافِذَةٌ', nameEn: 'Window',       emoji: '🪟', descAr: 'نرى منها الخارج', descEn: 'We see outside' },
      { id: 'chair',  nameAr: 'كُرْسِيٌّ', nameEn: 'Chair',        emoji: '🪑', descAr: 'نجلس عليه', descEn: 'We sit on it' },
      { id: 'table',  nameAr: 'طَاوِلَةٌ', nameEn: 'Table',        emoji: '🪵', descAr: 'نضع الطعام عليها', descEn: 'We put food on it' },
      { id: 'bed',    nameAr: 'سَرِيرٌ',  nameEn: 'Bed',          emoji: '🛏️', descAr: 'ننام عليه', descEn: 'We sleep on it' },
      { id: 'sofa',   nameAr: 'أَرِيكَةٌ', nameEn: 'Sofa',         emoji: '🛋️', descAr: 'نجلس ونرتاح', descEn: 'We relax on it' },
      { id: 'lamp',   nameAr: 'مِصْبَاحٌ', nameEn: 'Lamp',         emoji: '💡', descAr: 'يضيء الغرفة', descEn: 'Lights the room' },
      { id: 'tv',     nameAr: 'تِلْفَازٌ', nameEn: 'TV',           emoji: '📺', descAr: 'نشاهد فيه', descEn: 'We watch it' },
      { id: 'fridge', nameAr: 'ثَلَّاجَةٌ', nameEn: 'Refrigerator', emoji: '🧊', descAr: 'تحفظ الطعام بارداً', descEn: 'Keeps food cold' },
      { id: 'kitchen',nameAr: 'مَطْبَخٌ', nameEn: 'Kitchen',      emoji: '🍳', descAr: 'نطبخ فيه', descEn: 'We cook here' },
      { id: 'bath',   nameAr: 'حَمَّامٌ', nameEn: 'Bathroom',     emoji: '🚿', descAr: 'نستحم فيه', descEn: 'We shower here' },
      { id: 'pillow', nameAr: 'وِسَادَةٌ', nameEn: 'Pillow', emoji: '🛏️', descAr: 'نضعها تحت الرأس عند النوم', descEn: 'We put it under the head when sleeping' },
      { id: 'closet', nameAr: 'خِزَانَةٌ', nameEn: 'Closet', emoji: '🗄️', descAr: 'نضع فيها الملابس', descEn: 'We keep clothes in it' },
      { id: 'mirror', nameAr: 'مِرْآةٌ', nameEn: 'Mirror', emoji: '🪞', descAr: 'نرى صورتنا فيها', descEn: 'We see our reflection in it' },
      { id: 'clock', nameAr: 'سَاعَةٌ', nameEn: 'Clock', emoji: '🕐', descAr: 'تخبرنا بالوقت', descEn: 'It tells us the time' },
      { id: 'carpet', nameAr: 'سَجَّادَةٌ', nameEn: 'Carpet', emoji: '🧶', descAr: 'تغطي أرضية الغرفة', descEn: 'It covers the floor' },
      { id: 'spoon', nameAr: 'مِلْعَقَةٌ', nameEn: 'Spoon', emoji: '🥄', descAr: 'نستخدمها لتناول الطعام', descEn: 'We use it to eat' },
      { id: 'cup', nameAr: 'كُوبٌ', nameEn: 'Cup', emoji: '🥤', descAr: 'نشرب فيه', descEn: 'We drink from it' },
      { id: 'plate', nameAr: 'صَحْنٌ', nameEn: 'Plate', emoji: '🍽️', descAr: 'نضع الطعام عليه', descEn: 'We put food on it' },
      // ——— إضافات جديدة ———
      { id: 'guestroom', nameAr: 'غُرْفَةُ الضُّيُوفِ', nameEn: 'Guest Room', emoji: '🛋️', descAr: 'نستقبل فيها الضيوف', descEn: 'We welcome guests here' },
      { id: 'garden', nameAr: 'حَدِيقَةُ الْبَيْتِ', nameEn: 'Home Garden', emoji: '🌷', descAr: 'نزرع فيها الأزهار', descEn: 'We plant flowers here' },
      { id: 'key', nameAr: 'مِفْتَاحٌ', nameEn: 'Key', emoji: '🔑', descAr: 'نفتح به الباب', descEn: 'We open the door with it' },
      { id: 'stairs', nameAr: 'سُلَّمٌ', nameEn: 'Stairs', emoji: '🪜', descAr: 'نصعد عليه للطابق الأعلى', descEn: 'We climb it to the upper floor' },
    ],
  },

  // ——— 🎨 اكتشف الألوان ———
  {
    id: 'colors',
    titleAr: 'اكْتَشِفِ الْأَلْوَانَ',
    titleEn: 'Discover Colors',
    emoji: '🎨',
    color: '#8b5fbf',
    colorEnd: '#3aa0d9',
    sceneEmojis: ['🌈', '🎨', '🖌️', '✨'],
    items: [
      { id: 'red',    nameAr: 'أَحْمَرُ',   nameEn: 'Red',    emoji: '🔴', color: '#ef4444' },
      { id: 'blue',   nameAr: 'أَزْرَقُ',   nameEn: 'Blue',   emoji: '🔵', color: '#3b82f6' },
      { id: 'yellow', nameAr: 'أَصْفَرُ',   nameEn: 'Yellow', emoji: '🟡', color: '#f7f306' },
      { id: 'green',  nameAr: 'أَخْضَرُ',   nameEn: 'Green',  emoji: '🟢', color: '#22c55e' },
      { id: 'orange', nameAr: 'بُرْتُقَالِيٌّ', nameEn: 'Orange', emoji: '🟠', color: '#f97316' },
      { id: 'purple', nameAr: 'بَنَفْسَجِيٌّ', nameEn: 'Purple', emoji: '🟣', color: '#a855f7' },
      { id: 'pink',   nameAr: 'وَرْدِيٌّ',   nameEn: 'Pink',   emoji: '🌸', color: '#ec4899' },
      { id: 'black',  nameAr: 'أَسْوَدُ',   nameEn: 'Black',  emoji: '⚫', color: '#000000' },
      { id: 'white',  nameAr: 'أَبْيَضُ',   nameEn: 'White',  emoji: '⚪', color: '#ffffff' },
      { id: 'brown',  nameAr: 'بُنِّيٌّ',   nameEn: 'Brown',  emoji: '🟤', color: '#903a04' },
      { id: 'gray', nameAr: 'رَمَادِيٌّ', nameEn: 'Gray', emoji: '🩶' },
      { id: 'turquoise', nameAr: 'فِيرُوزِيٌّ', nameEn: 'Turquoise', emoji: '🩵' },
      { id: 'gold', nameAr: 'ذَهَبِيٌّ', nameEn: 'Gold', emoji: '🥇' },
      { id: 'silver', nameAr: 'فِضِّيٌّ', nameEn: 'Silver', emoji: '⚪' },
      { id: 'beige', nameAr: 'بَيْجٌ', nameEn: 'Beige', emoji: '🟫' },
    ],
  },

  // ——— 🚗 اكتشف وسائل النقل ———
  {
    id: 'transport',
    titleAr: 'اكْتَشِفْ وَسَائِلَ النَّقْلِ',
    titleEn: 'Discover Transport',
    emoji: '🚗',
    color: '#3aa0d9',
    colorEnd: '#2fb68c',
    sceneEmojis: ['🌆', '🛣️', '🌤️', '🚦'],
    items: [
      { id: 'car',        nameAr: 'سَيَّارَةٌ',       nameEn: 'Car',          emoji: '🚗' },
      { id: 'bus',        nameAr: 'حَافِلَةٌ',        nameEn: 'Bus',          emoji: '🚌' },
      { id: 'truck',      nameAr: 'شَاحِنَةٌ',        nameEn: 'Truck',        emoji: '🚚' },
      { id: 'train',      nameAr: 'قِطَارٌ',          nameEn: 'Train',        emoji: '🚂' },
      { id: 'airplane',   nameAr: 'طَائِرَةٌ',        nameEn: 'Airplane',     emoji: '✈️' },
      { id: 'ship',       nameAr: 'سَفِينَةٌ',        nameEn: 'Ship',         emoji: '🚢' },
      { id: 'bicycle',    nameAr: 'دَرَّاجَةٌ',       nameEn: 'Bicycle',      emoji: '🚲' },
      { id: 'motorcycle', nameAr: 'دَرَّاجَةٌ نَارِيَّةٌ', nameEn: 'Motorcycle', emoji: '🏍️' },
      { id: 'ambulance',  nameAr: 'سَيَّارَةُ إِسْعَافٍ', nameEn: 'Ambulance', emoji: '🚑' },
      { id: 'firetruck',  nameAr: 'سَيَّارَةُ إِطْفَاءٍ', nameEn: 'Fire Truck', emoji: '🚒' },
      { id: 'helicopter', nameAr: 'طَائِرَةٌ مِرْوَحِيَّةٌ', nameEn: 'Helicopter', emoji: '🚁' },
      { id: 'subway', nameAr: 'قِطَارُ الْمِتْرُو', nameEn: 'Subway', emoji: '🚇' },
      { id: 'taxi', nameAr: 'سَيَّارَةُ أُجْرَةٍ', nameEn: 'Taxi', emoji: '🚕' },
      { id: 'scooter', nameAr: 'سُكُوتَرٌ', nameEn: 'Scooter', emoji: '🛴' },
      { id: 'boat', nameAr: 'قَارِبٌ', nameEn: 'Boat', emoji: '🛶' },
      { id: 'hotairballoon', nameAr: 'مَنْطَادٌ', nameEn: 'Hot-air balloon', emoji: '🎈' },
    ],
  },

  // ——— 🌾 اكتشف المزرعة ———
  {
    id: 'farm',
    titleAr: 'اكْتَشِفِ الْمَزْرَعَةَ',
    titleEn: 'Discover the Farm',
    emoji: '🌾',
    color: '#2fb68c',
    colorEnd: '#ffd166',
    sceneEmojis: ['🌾', '☀️', '🌿', '🏡'],
    items: [
      { id: 'cow',     nameAr: 'بَقَرَةٌ',   nameEn: 'Cow',     emoji: '🐄' },
      { id: 'horse',   nameAr: 'حِصَانٌ',    nameEn: 'Horse',   emoji: '🐴' },
      { id: 'sheep',   nameAr: 'خَرُوفٌ',    nameEn: 'Sheep',   emoji: '🐑' },
      { id: 'chicken', nameAr: 'دَجَاجَةٌ',  nameEn: 'Chicken', emoji: '🐔' },
      { id: 'rooster', nameAr: 'دِيكٌ',      nameEn: 'Rooster', emoji: '🐓' },
      { id: 'rabbit',  nameAr: 'أَرْنَبٌ',   nameEn: 'Rabbit',  emoji: '🐇' },
      { id: 'farm',    nameAr: 'مَزْرَعَةٌ', nameEn: 'Farm',    emoji: '🌾' },
      { id: 'barn',    nameAr: 'حَظِيرَةٌ',  nameEn: 'Barn',    emoji: '🏚️' },
      { id: 'tree',    nameAr: 'شَجَرَةٌ',   nameEn: 'Tree',    emoji: '🌳' },
      { id: 'crop',    nameAr: 'مَحْصُولٌ',  nameEn: 'Crop',    emoji: '🌽' },
      { id: 'goat', nameAr: 'مَاعِزٌ', nameEn: 'Goat', emoji: '🐐' },
      { id: 'duck', nameAr: 'بَطَّةٌ', nameEn: 'Duck', emoji: '🦆' },
      { id: 'bee', nameAr: 'نَحْلَةٌ', nameEn: 'Bee', emoji: '🐝' },
      { id: 'farmer', nameAr: 'مُزَارِعٌ', nameEn: 'Farmer', emoji: '🧑‍🌾' },
      { id: 'tractor', nameAr: 'جَرَّارٌ زِرَاعِيٌّ', nameEn: 'Tractor', emoji: '🚜' },
      { id: 'wheat', nameAr: 'قَمْحٌ', nameEn: 'Wheat', emoji: '🌾' },
      { id: 'carrot', nameAr: 'جَزَرٌ', nameEn: 'Carrot', emoji: '🥕' },
    ],
  },

  // ——— 🐘 اكتشف الحيوانات ———
  {
    id: 'animals',
    titleAr: 'اكْتَشِفِ الْحَيَوَانَاتِ',
    titleEn: 'Discover Animals',
    emoji: '🐘',
    color: '#e85d75',
    colorEnd: '#ff9f45',
    sceneEmojis: ['🌴', '🌿', '🦋', '🌞'],
    items: [
      { id: 'lion',    nameAr: 'أَسَدٌ',    nameEn: 'Lion',     emoji: '🦁' },
      { id: 'elephant',nameAr: 'فِيلٌ',     nameEn: 'Elephant', emoji: '🐘' },
      { id: 'giraffe', nameAr: 'زَرَافَةٌ', nameEn: 'Giraffe',  emoji: '🦒' },
      { id: 'monkey',  nameAr: 'قِرْدٌ',    nameEn: 'Monkey',   emoji: '🐒' },
      { id: 'bear',    nameAr: 'دُبٌّ',     nameEn: 'Bear',     emoji: '🐻' },
      { id: 'rabbit2', nameAr: 'أَرْنَبٌ',  nameEn: 'Rabbit',   emoji: '🐇' },
      { id: 'cat',     nameAr: 'قِطَّةٌ',   nameEn: 'Cat',      emoji: '🐱' },
      { id: 'dog',     nameAr: 'كَلْبٌ',    nameEn: 'Dog',      emoji: '🐶' },
      { id: 'bird',    nameAr: 'طَائِرٌ',   nameEn: 'Bird',     emoji: '🐦' },
      { id: 'fish',    nameAr: 'سَمَكَةٌ',  nameEn: 'Fish',     emoji: '🐟' },
      { id: 'tiger', nameAr: 'نَمِرٌ', nameEn: 'Tiger', emoji: '🐯' },
      { id: 'zebra', nameAr: 'حِمَارٌ وَحْشِيٌّ', nameEn: 'Zebra', emoji: '🦓' },
      { id: 'fox', nameAr: 'ثَعْلَبٌ', nameEn: 'Fox', emoji: '🦊' },
      { id: 'wolf', nameAr: 'ذِئْبٌ', nameEn: 'Wolf', emoji: '🐺' },
      { id: 'deer', nameAr: 'غَزَالٌ', nameEn: 'Deer', emoji: '🦌' },
      { id: 'turtle', nameAr: 'سُلَحْفَاةٌ', nameEn: 'Turtle', emoji: '🐢' },
      { id: 'dolphin', nameAr: 'دُلْفِينٌ', nameEn: 'Dolphin', emoji: '🐬' },
      { id: 'penguin', nameAr: 'بِطْرِيقٌ', nameEn: 'Penguin', emoji: '🐧' },
      // ——— إضافات: بحرية + حشرات ———
      { id: 'whale', nameAr: 'حُوتٌ', nameEn: 'Whale', emoji: '🐋', descAr: 'أكبر حيوان في البحر', descEn: 'The largest sea animal' },
      { id: 'octopus', nameAr: 'أَخْطَبُوطٌ', nameEn: 'Octopus', emoji: '🐙', descAr: 'له ثمانية أذرع', descEn: 'It has eight arms' },
      { id: 'shark', nameAr: 'قِرْشٌ', nameEn: 'Shark', emoji: '🦈', descAr: 'سمكة قوية', descEn: 'A strong fish' },
      { id: 'crab', nameAr: 'سَرَطَانٌ', nameEn: 'Crab', emoji: '🦀', descAr: 'يمشي بشكل جانبي', descEn: 'Walks sideways' },
      { id: 'butterfly', nameAr: 'فَرَاشَةٌ', nameEn: 'Butterfly', emoji: '🦋', descAr: 'حشرة جميلة الألوان', descEn: 'A colorful insect' },
      { id: 'ant', nameAr: 'نَمْلَةٌ', nameEn: 'Ant', emoji: '🐜', descAr: 'حشرة صغيرة مجتهدة', descEn: 'A small hardworking insect' },
      { id: 'spider', nameAr: 'عَنْكَبُوتٌ', nameEn: 'Spider', emoji: '🕷️', descAr: 'ينسج شبكة', descEn: 'It spins a web' },
      { id: 'snail', nameAr: 'حَلَزُونٌ', nameEn: 'Snail', emoji: '🐌', descAr: 'يحمل بيته معه', descEn: 'It carries its home' },
    ],
  },

  // ——— 🍎 اكتشف الطعام ———
  {
    id: 'food',
    titleAr: 'اكْتَشِفِ الطَّعَامَ',
    titleEn: 'Discover Food',
    emoji: '🍎',
    color: '#ffd166',
    colorEnd: '#2fb68c',
    sceneEmojis: ['🍽️', '🌟', '🌈', '✨'],
    items: [
      { id: 'apple',  nameAr: 'تُفَّاحَةٌ',  nameEn: 'Apple',  emoji: '🍎' },
      { id: 'banana', nameAr: 'مَوْزَةٌ',    nameEn: 'Banana', emoji: '🍌' },
      { id: 'orange', nameAr: 'بُرْتُقَالَةٌ', nameEn: 'Orange', emoji: '🍊' },
      { id: 'milk',   nameAr: 'حَلِيبٌ',     nameEn: 'Milk',   emoji: '🥛' },
      { id: 'bread',  nameAr: 'خُبْزٌ',      nameEn: 'Bread',  emoji: '🍞' },
      { id: 'cheese', nameAr: 'جُبْنٌ',      nameEn: 'Cheese', emoji: '🧀' },
      { id: 'rice',   nameAr: 'أُرُزٌّ',     nameEn: 'Rice',   emoji: '🍚' },
      { id: 'egg',    nameAr: 'بَيْضَةٌ',    nameEn: 'Egg',    emoji: '🥚' },
      { id: 'water',  nameAr: 'مَاءٌ',       nameEn: 'Water',  emoji: '💧' },
      { id: 'grape',  nameAr: 'عِنَبٌ',      nameEn: 'Grape',  emoji: '🍇' },
      { id: 'strawberry', nameAr: 'فَرَاوِلَةٌ', nameEn: 'Strawberry', emoji: '🍓' },
      { id: 'watermelon', nameAr: 'بِطِّيخٌ', nameEn: 'Watermelon', emoji: '🍉' },
      { id: 'tomato', nameAr: 'طَمَاطِمُ', nameEn: 'Tomato', emoji: '🍅' },
      { id: 'carrot', nameAr: 'جَزَرٌ', nameEn: 'Carrot', emoji: '🥕' },
      { id: 'chicken', nameAr: 'دَجَاجٌ', nameEn: 'Chicken', emoji: '🍗' },
      { id: 'dates', nameAr: 'تَمْرٌ', nameEn: 'Dates', emoji: '🌴' },
      { id: 'honey', nameAr: 'عَسَلٌ', nameEn: 'Honey', emoji: '🍯' },
      { id: 'cake', nameAr: 'كَعْكٌ', nameEn: 'Cake', emoji: '🍰' },
      // ——— إضافات: حلويات + مشروبات ———
      { id: 'juice', nameAr: 'عَصِيرٌ', nameEn: 'Juice', emoji: '🧃', descAr: 'نشربه من الفواكه', descEn: 'Made from fruits' },
      { id: 'tea', nameAr: 'شَايٌ', nameEn: 'Tea', emoji: '🍵', descAr: 'شراب ساخن', descEn: 'A hot drink' },
      { id: 'icecream', nameAr: 'آيْسْ كْرِيم', nameEn: 'Ice cream', emoji: '🍦', descAr: 'حلوى باردة', descEn: 'A cold dessert' },
      { id: 'chocolate', nameAr: 'شُوكُولَاتَةٌ', nameEn: 'Chocolate', emoji: '🍫', descAr: 'حلوى بنية', descEn: 'A brown sweet' },
    ],
  },

  // ——— 👕 اكتشف الملابس ———
  {
    id: 'clothes',
    titleAr: 'اكْتَشِفِ الْمَلَابِسَ',
    titleEn: 'Discover Clothes',
    emoji: '👕',
    color: '#3aa0d9',
    colorEnd: '#8b5fbf',
    sceneEmojis: ['👗', '🌸', '🌟', '✨'],
    items: [
      { id: 'shirt',  nameAr: 'قَمِيصٌ',  nameEn: 'Shirt',    emoji: '👕' },
      { id: 'pants',  nameAr: 'بَنْطَلُونٌ', nameEn: 'Pants', emoji: '👖' },
      { id: 'dress',  nameAr: 'فُسْتَانٌ', nameEn: 'Dress',   emoji: '👗' },
      { id: 'shoes',  nameAr: 'حِذَاءٌ',  nameEn: 'Shoes',    emoji: '👟' },
      { id: 'hat',    nameAr: 'قُبَّعَةٌ', nameEn: 'Hat',     emoji: '🎩' },
      { id: 'sock',   nameAr: 'جَوْرَبٌ', nameEn: 'Sock',    emoji: '🧦' },
      { id: 'coat',   nameAr: 'مِعْطَفٌ', nameEn: 'Coat',    emoji: '🧥' },
      { id: 'gloves', nameAr: 'قُفَّازَانِ', nameEn: 'Gloves', emoji: '🧤' },
      { id: 'tshirt', nameAr: 'قَمِيصٌ قَصِيرُ الْكُمِّ', nameEn: 'T-shirt', emoji: '👕' },
      { id: 'skirt', nameAr: 'تَنُّورَةٌ', nameEn: 'Skirt', emoji: '🩳' },
      { id: 'scarf', nameAr: 'وِشَاحٌ', nameEn: 'Scarf', emoji: '🧣' },
      { id: 'pajamas', nameAr: 'مَلَابِسُ نَوْمٍ', nameEn: 'Pajamas', emoji: '🛌' },
      { id: 'belt', nameAr: 'حِزَامٌ', nameEn: 'Belt', emoji: '🪢' },
      { id: 'sandals', nameAr: 'صَنْدَلٌ', nameEn: 'Sandals', emoji: '👡' },
      { id: 'uniform', nameAr: 'زِيٌّ مَدْرَسِيٌّ', nameEn: 'Uniform', emoji: '🥋' },
      // ——— إضافات: ملابس الفصول + إكسسوارات ———
      { id: 'rainboots', nameAr: 'حِذَاءُ الْمَطَرِ', nameEn: 'Rain boots', emoji: '🥾', descAr: 'نلبسه في المطر', descEn: 'We wear them in rain' },
      { id: 'watch', nameAr: 'سَاعَةُ الْيَدِ', nameEn: 'Watch', emoji: '⌚', descAr: 'نعرف بها الوقت', descEn: 'Tells us the time' },
      { id: 'glasses', nameAr: 'نَظَّارَةٌ', nameEn: 'Glasses', emoji: '👓', descAr: 'نساعد بها العين', descEn: 'Helps our eyes' },
      { id: 'umbrella2', nameAr: 'مِظَلَّةٌ', nameEn: 'Umbrella', emoji: '☂️', descAr: 'تحمينا من المطر', descEn: 'Protects us from rain' },
    ],
  },

  // ——— 🌳 اكتشف الطبيعة ———
  {
    id: 'nature',
    titleAr: 'اكْتَشِفِ الطَّبِيعَةَ',
    titleEn: 'Discover Nature',
    emoji: '🌳',
    color: '#2fb68c',
    colorEnd: '#3aa0d9',
    sceneEmojis: ['🌄', '🌿', '☁️', '🦋'],
    items: [
      { id: 'tree',     nameAr: 'شَجَرَةٌ', nameEn: 'Tree',     emoji: '🌳' },
      { id: 'flower',   nameAr: 'زَهْرَةٌ', nameEn: 'Flower',   emoji: '🌸' },
      { id: 'sun',      nameAr: 'شَمْسٌ',   nameEn: 'Sun',      emoji: '☀️' },
      { id: 'moon',     nameAr: 'قَمَرٌ',   nameEn: 'Moon',     emoji: '🌙' },
      { id: 'cloud',    nameAr: 'سَحَابَةٌ', nameEn: 'Cloud',   emoji: '☁️' },
      { id: 'rain',     nameAr: 'مَطَرٌ',   nameEn: 'Rain',     emoji: '🌧️' },
      { id: 'mountain', nameAr: 'جَبَلٌ',   nameEn: 'Mountain', emoji: '🏔️' },
      { id: 'river',    nameAr: 'نَهْرٌ',   nameEn: 'River',    emoji: '🌊' },
      { id: 'sea',      nameAr: 'بَحْرٌ',   nameEn: 'Sea',      emoji: '🌊' },
      { id: 'star',     nameAr: 'نَجْمَةٌ', nameEn: 'Star',     emoji: '⭐' },
      { id: 'grass', nameAr: 'عُشْبٌ', nameEn: 'Grass', emoji: '🌱' },
      { id: 'leaf', nameAr: 'وَرَقَةٌ', nameEn: 'Leaf', emoji: '🍃' },
      { id: 'seed', nameAr: 'بِذْرَةٌ', nameEn: 'Seed', emoji: '🌱' },
      { id: 'rainbow', nameAr: 'قَوْسُ المَطَرْ', nameEn: 'Rainbow', emoji: '🌈' },
      { id: 'wind', nameAr: 'رِيحٌ', nameEn: 'Wind', emoji: '💨' },
      { id: 'snow', nameAr: 'ثَلْجٌ', nameEn: 'Snow', emoji: '❄️' },
      { id: 'island', nameAr: 'جَزِيرَةٌ', nameEn: 'Island', emoji: '🏝️' },
      { id: 'forest', nameAr: 'غَابَةٌ', nameEn: 'Forest', emoji: '🌲' },
      // ——— إضافات ———
      { id: 'waterfall', nameAr: 'شَلَّالٌ', nameEn: 'Waterfall', emoji: '💦', descAr: 'ماء ينزل من مكان عالٍ', descEn: 'Water falling from high' },
      { id: 'desert', nameAr: 'صَحْرَاءُ', nameEn: 'Desert', emoji: '🏜️', descAr: 'أرض رملية واسعة', descEn: 'A wide sandy land' },
      { id: 'valley', nameAr: 'وَادٍ', nameEn: 'Valley', emoji: '🏞️', descAr: 'أرض منخفضة بين الجبال', descEn: 'Low land between mountains' },
    ],
  },

  // ——— 🏫 اكتشف المدرسة ———
  {
    id: 'school',
    titleAr: 'اكْتَشِفِ الْمَدْرَسَةَ',
    titleEn: 'Discover School',
    emoji: '🏫',
    color: '#8b5fbf',
    colorEnd: '#3aa0d9',
    sceneEmojis: ['🏫', '📚', '✏️', '🌟'],
    items: [
      { id: 'school2', nameAr: 'مَدْرَسَةٌ',  nameEn: 'School',    emoji: '🏫' },
      { id: 'book',    nameAr: 'كِتَابٌ',    nameEn: 'Book',      emoji: '📚' },
      { id: 'pen',     nameAr: 'قَلَمٌ',     nameEn: 'Pen',       emoji: '✏️' },
      { id: 'bag',     nameAr: 'حَقِيبَةٌ',  nameEn: 'Backpack',  emoji: '🎒' },
      { id: 'board',   nameAr: 'سَبُّورَةٌ', nameEn: 'Board',     emoji: '🖊️' },
      { id: 'desk',    nameAr: 'مَكْتَبٌ',   nameEn: 'Desk',      emoji: '🪑' },
      { id: 'ruler',   nameAr: 'مِسْطَرَةٌ', nameEn: 'Ruler',     emoji: '📏' },
      { id: 'eraser',  nameAr: 'مِمْحَاةٌ',  nameEn: 'Eraser',    emoji: '🟦' },
      { id: 'teacher', nameAr: 'مُعَلِّمٌ',  nameEn: 'Teacher',   emoji: '👩‍🏫' },
      { id: 'crayon', nameAr: 'قَلَمُ تَلْوِينٍ', nameEn: 'Crayon', emoji: '🖍️' },
      { id: 'scissors', nameAr: 'مِقَصٌّ', nameEn: 'Scissors', emoji: '✂️' },
      { id: 'glue', nameAr: 'غِرَاءٌ', nameEn: 'Glue', emoji: '🧴' },
      { id: 'pencilcase', nameAr: 'مِقْلَمَةٌ', nameEn: 'Pencil case', emoji: '🖊️' },
      { id: 'computer', nameAr: 'حَاسُوبٌ', nameEn: 'Computer', emoji: '💻' },
      { id: 'map', nameAr: 'خَرِيطَةٌ', nameEn: 'Map', emoji: '🗺️' },
      { id: 'clock', nameAr: 'سَاعَةٌ', nameEn: 'Clock', emoji: '🕐' },
      { id: 'playground', nameAr: 'مَلْعَبٌ', nameEn: 'Playground', emoji: '🛝' },
    ],
  },

  // ——— 👨‍⚕️ اكتشف المهن ———
  {
    id: 'jobs',
    titleAr: 'اكْتَشِفِ الْمِهَنَ',
    titleEn: 'Discover Jobs',
    emoji: '👨‍⚕️',
    color: '#e85d75',
    colorEnd: '#8b5fbf',
    sceneEmojis: ['🌆', '⭐', '🏙️', '✨'],
    items: [
      { id: 'doctor',     nameAr: 'طَبِيبٌ',      nameEn: 'Doctor',        emoji: '👨‍⚕️' },
      { id: 'teacher2',   nameAr: 'مُعَلِّمٌ',     nameEn: 'Teacher',       emoji: '👩‍🏫' },
      { id: 'engineer',   nameAr: 'مُهَنْدِسٌ',    nameEn: 'Engineer',      emoji: '👷' },
      { id: 'police',     nameAr: 'شُرْطِيٌّ',     nameEn: 'Police',        emoji: '👮' },
      { id: 'chef',       nameAr: 'طَبَّاخٌ',      nameEn: 'Chef',          emoji: '👨‍🍳' },
      { id: 'farmer',     nameAr: 'مُزَارِعٌ',     nameEn: 'Farmer',        emoji: '👨‍🌾' },
      { id: 'firefighter',nameAr: 'رَجُلُ إِطْفَاءٍ', nameEn: 'Firefighter', emoji: '🧑‍🚒' },
      { id: 'pilot',      nameAr: 'طَيَّارٌ',      nameEn: 'Pilot',         emoji: '🧑‍✈️' },
      { id: 'nurse', nameAr: 'مُمَرِّضٌ', nameEn: 'Nurse', emoji: '👩‍⚕️' },
      { id: 'dentist', nameAr: 'طَبِيبُ أَسْنَانٍ', nameEn: 'Dentist', emoji: '🦷' },
      { id: 'veterinarian', nameAr: 'طَبِيبُ حَيَوَانَاتٍ', nameEn: 'Veterinarian', emoji: '🐾' },
      { id: 'driver', nameAr: 'سَائِقٌ', nameEn: 'Driver', emoji: '🧑‍✈️' },
      { id: 'carpenter', nameAr: 'نَجَّارٌ', nameEn: 'Carpenter', emoji: '🪚' },
      { id: 'baker', nameAr: 'خَبَّازٌ', nameEn: 'Baker', emoji: '🥖' },
      { id: 'artist', nameAr: 'فَنَّانٌ', nameEn: 'Artist', emoji: '🎨' },
      { id: 'astronaut', nameAr: 'رَائِدُ فَضَاءٍ', nameEn: 'Astronaut', emoji: '👨‍🚀' },
      { id: 'programmer', nameAr: 'مُبَرْمِجٌ', nameEn: 'Programmer', emoji: '💻' },
      { id: 'photographer', nameAr: 'مُصَوِّرٌ', nameEn: 'Photographer', emoji: '📷' },
    ],
  },

  // ——— 🧍 اكتشف جسم الإنسان ———
  {
    id: 'body',
    titleAr: 'اكْتَشِفْ جِسْمَ الإِنْسَانِ',
    titleEn: 'Discover the Human Body',
    emoji: '🧍',
    color: '#f97316',
    colorEnd: '#ec4899',
    sceneEmojis: ['🧍', '❤️', '👁️', '✨'],
    items: [
      { id: 'head', nameAr: 'رَأْسٌ', nameEn: 'Head', emoji: '🙂', descAr: 'في أعلى الجسم', descEn: 'At the top of the body' },
      { id: 'eye', nameAr: 'عَيْنٌ', nameEn: 'Eye', emoji: '👁️', descAr: 'نرى بها', descEn: 'We see with it' },
      { id: 'ear', nameAr: 'أُذُنٌ', nameEn: 'Ear', emoji: '👂', descAr: 'نسمع بها', descEn: 'We hear with it' },
      { id: 'nose', nameAr: 'أَنْفٌ', nameEn: 'Nose', emoji: '👃', descAr: 'نشم به', descEn: 'We smell with it' },
      { id: 'mouth', nameAr: 'فَمٌ', nameEn: 'Mouth', emoji: '👄', descAr: 'نتكلم ونأكل به', descEn: 'We talk and eat with it' },
      { id: 'hand', nameAr: 'يَدٌ', nameEn: 'Hand', emoji: '✋', descAr: 'نمسك بها الأشياء', descEn: 'We hold things with it' },
      { id: 'finger', nameAr: 'إِصْبَعٌ', nameEn: 'Finger', emoji: '☝️', descAr: 'جزء من اليد', descEn: 'Part of the hand' },
      { id: 'leg', nameAr: 'سَاقٌ', nameEn: 'Leg', emoji: '🦵', descAr: 'تساعدنا على المشي', descEn: 'Helps us walk' },
      { id: 'foot', nameAr: 'قَدَمٌ', nameEn: 'Foot', emoji: '🦶', descAr: 'نقف ونمشي بها', descEn: 'We stand and walk with it' },
      { id: 'heart', nameAr: 'قَلْبٌ', nameEn: 'Heart', emoji: '❤️', descAr: 'يضخ الدم في الجسم', descEn: 'Pumps blood around the body' },
      { id: 'teeth', nameAr: 'أَسْنَانٌ', nameEn: 'Teeth', emoji: '🦷', descAr: 'نستخدمها لمضغ الطعام', descEn: 'We use them to chew food' },
      { id: 'hair', nameAr: 'شَعْرٌ', nameEn: 'Hair', emoji: '💇', descAr: 'ينمو على الرأس', descEn: 'Grows on the head' },
    ],
  },

  // ——— 🏙️ اكتشف المدينة ———
  {
    id: 'city',
    titleAr: 'اكْتَشِفِ الْمَدِينَةَ',
    titleEn: 'Discover the City',
    emoji: '🏙️',
    color: '#3aa0d9',
    colorEnd: '#8b5fbf',
    sceneEmojis: ['🏙️', '🚦', '🏥', '🌳'],
    items: [
      { id: 'building', nameAr: 'مَبْنًى', nameEn: 'Building', emoji: '🏢', descAr: 'مكان له طوابق', descEn: 'A place with floors' },
      { id: 'hospital', nameAr: 'مُسْتَشْفًى', nameEn: 'Hospital', emoji: '🏥', descAr: 'نذهب إليه للعلاج', descEn: 'We go there for treatment' },
      { id: 'park', nameAr: 'حَدِيقَةٌ', nameEn: 'Park', emoji: '🌳', descAr: 'مكان للعب والراحة', descEn: 'A place to play and relax' },
      { id: 'road', nameAr: 'طَرِيقٌ', nameEn: 'Road', emoji: '🛣️', descAr: 'تسير عليه المركبات', descEn: 'Vehicles travel on it' },
      { id: 'trafficlight', nameAr: 'إِشَارَةُ مُرُورٍ', nameEn: 'Traffic light', emoji: '🚦', descAr: 'تنظم حركة المرور', descEn: 'Controls traffic' },
      { id: 'mosque', nameAr: 'مَسْجِدٌ', nameEn: 'Mosque', emoji: '🕌', descAr: 'مكان للصلاة', descEn: 'A place for prayer' },
      { id: 'market', nameAr: 'سُوقٌ', nameEn: 'Market', emoji: '🛍️', descAr: 'نشتري منه الأشياء', descEn: 'We buy things there' },
      { id: 'library', nameAr: 'مَكْتَبَةٌ', nameEn: 'Library', emoji: '📖', descAr: 'مكان للكتب والقراءة', descEn: 'A place for books and reading' },
      { id: 'bridge', nameAr: 'جِسْرٌ', nameEn: 'Bridge', emoji: '🌉', descAr: 'يساعدنا على عبور الماء أو الطريق', descEn: 'Helps us cross water or a road' },
      { id: 'streetlamp', nameAr: 'مِصْبَاحُ شَارِعٍ', nameEn: 'Street lamp', emoji: '💡', descAr: 'يضيء الطريق ليلًا', descEn: 'Lights the road at night' },
    ],
  },

  // ——— 🌦️ اكتشف الطقس والفصول ———
  {
    id: 'weather',
    titleAr: 'اكْتَشِفِ الطَّقْسَ وَالْفُصُولَ',
    titleEn: 'Discover Weather & Seasons',
    emoji: '🌦️',
    color: '#3aa0d9',
    colorEnd: '#ffd166',
    sceneEmojis: ['☀️', '☁️', '🌧️', '🌈'],
    items: [
      { id: 'sunny', nameAr: 'مُشْمِسٌ', nameEn: 'Sunny', emoji: '☀️', descAr: 'تظهر فيه الشمس', descEn: 'The sun is shining' },
      { id: 'cloudy', nameAr: 'غَائِمٌ', nameEn: 'Cloudy', emoji: '☁️', descAr: 'تكثر فيه السحب', descEn: 'There are many clouds' },
      { id: 'rainy', nameAr: 'مُمْطِرٌ', nameEn: 'Rainy', emoji: '🌧️', descAr: 'ينزل فيه المطر', descEn: 'Rain is falling' },
      { id: 'windy', nameAr: 'عَاصِفٌ', nameEn: 'Windy', emoji: '💨', descAr: 'تهب فيه الرياح', descEn: 'The wind is blowing' },
      { id: 'snowy', nameAr: 'مُثْلِجٌ', nameEn: 'Snowy', emoji: '🌨️', descAr: 'يتساقط فيه الثلج', descEn: 'Snow is falling' },
      { id: 'rainbow2', nameAr: 'قَوْسُ المَطَرْ', nameEn: 'Rainbow', emoji: '🌈', descAr: 'يظهر بألوان جميلة بعد المطر أحيانًا', descEn: 'Appears after rain' },
      { id: 'umbrella', nameAr: 'مِظَلَّةٌ', nameEn: 'Umbrella', emoji: '☂️', descAr: 'تحمينا من المطر', descEn: 'Protects us from rain' },
      { id: 'raincoat', nameAr: 'مِعْطَفٌ مَطَرِيٌّ', nameEn: 'Raincoat', emoji: '🧥', descAr: 'يساعدنا على البقاء جافين', descEn: 'Helps keep us dry' },
      // ——— إضافات: الفصول الأربعة ———
      { id: 'spring', nameAr: 'الرَّبِيعُ', nameEn: 'Spring', emoji: '🌸', descAr: 'فصل الأزهار والاعتدال', descEn: 'Season of flowers' },
      { id: 'summer', nameAr: 'الصَّيْفُ', nameEn: 'Summer', emoji: '🌞', descAr: 'فصل حار ومشمس', descEn: 'Hot and sunny season' },
      { id: 'autumn', nameAr: 'الْخَرِيفُ', nameEn: 'Autumn', emoji: '🍂', descAr: 'تتساقط فيه أوراق الشجر', descEn: 'Leaves fall in this season' },
      { id: 'winter', nameAr: 'الشِّتَاءُ', nameEn: 'Winter', emoji: '❄️', descAr: 'فصل بارد', descEn: 'Cold season' },
      // ——— ظواهر طبيعية ———
      { id: 'lightning', nameAr: 'بَرْقٌ', nameEn: 'Lightning', emoji: '⚡', descAr: 'ضوء قوي في السماء', descEn: 'A strong light in the sky' },
      { id: 'thunder', nameAr: 'رَعْدٌ', nameEn: 'Thunder', emoji: '🌩️', descAr: 'صوت قوي في السماء', descEn: 'A loud sound in the sky' },
      { id: 'fog', nameAr: 'ضَبَابٌ', nameEn: 'Fog', emoji: '🌫️', descAr: 'غيوم قريبة من الأرض', descEn: 'Clouds close to the ground' },
      { id: 'dew', nameAr: 'نَدًى', nameEn: 'Dew', emoji: '💧', descAr: 'قطرات صغيرة في الصباح', descEn: 'Small drops in the morning' },
    ],
  },

  // ——— 🛡️ اكتشف السلامة ———
  {
    id: 'safety',
    titleAr: 'اكْتَشِفِ السَّلَامَةَ',
    titleEn: 'Discover Safety',
    emoji: '🛡️',
    color: '#ef4444',
    colorEnd: '#f59e0b',
    sceneEmojis: ['🛡️', '🚦', '⛑️', '⭐'],
    items: [
      { id: 'helmet', nameAr: 'خُوذَةٌ', nameEn: 'Helmet', emoji: '⛑️', descAr: 'تحمي الرأس', descEn: 'Protects the head' },
      { id: 'seatbelt', nameAr: 'حِزَامُ الأَمَانِ', nameEn: 'Seat belt', emoji: '💺', descAr: 'نربطه في السيارة للسلامة', descEn: 'We fasten it in a car' },
      { id: 'crosswalk', nameAr: 'مَمَرُّ مُشَاةٍ', nameEn: 'Crosswalk', emoji: '🚸', descAr: 'نعبر الطريق من مكان آمن', descEn: 'A safer place to cross the road' },
      { id: 'stop', nameAr: 'تَوَقَّفْ', nameEn: 'Stop', emoji: '🛑', descAr: 'كلمة تعني أن نتوقف', descEn: 'A sign telling us to stop' },
      { id: 'firstaid', nameAr: 'حَقِيبَةُ إِسْعَافٍ', nameEn: 'First-aid kit', emoji: '🩹', descAr: 'تحتوي أدوات للإسعافات الأولية', descEn: 'Contains first-aid supplies' },
      { id: 'warning', nameAr: 'تَحْذِيرٌ', nameEn: 'Warning', emoji: '⚠️', descAr: 'ينبهنا إلى خطر محتمل', descEn: 'Alerts us to a possible danger' },
      { id: 'fireexit', nameAr: 'مَخْرَجُ طَوَارِئٍ', nameEn: 'Emergency exit', emoji: '🚪', descAr: 'مخرج نستخدمه عند الطوارئ', descEn: 'An exit used in emergencies' },
      { id: 'lifebuoy', nameAr: 'طَوَّافَةُ إِنْقَاذٍ', nameEn: 'Lifebuoy', emoji: '🛟', descAr: 'تساعد على النجاة في الماء', descEn: 'Helps keep someone afloat' },
    ],
  },

  // ——— 🧩 اكتشف الأشكال ———
  {
    id: 'shapes',
    titleAr: 'اكْتَشِفِ الأَشْكَالَ',
    titleEn: 'Discover Shapes',
    emoji: '🔷',
    color: '#8b5fbf',
    colorEnd: '#3aa0d9',
    sceneEmojis: ['🔴', '🟦', '🔺', '⭐'],
    items: [
      { id: 'circle', nameAr: 'دَائِرَةٌ', nameEn: 'Circle', emoji: '🔴', descAr: 'شكل مستدير بلا زوايا', descEn: 'A round shape with no corners' },
      { id: 'square', nameAr: 'مُرَبَّعٌ', nameEn: 'Square', emoji: '🟦', descAr: 'له أربعة أضلاع متساوية', descEn: 'Has four equal sides' },
      { id: 'triangle', nameAr: 'مُثَلَّثٌ', nameEn: 'Triangle', emoji: '🔺', descAr: 'له ثلاثة أضلاع', descEn: 'Has three sides' },
      { id: 'rectangle', nameAr: 'مُسْتَطِيلٌ', nameEn: 'Rectangle', emoji: '▭', descAr: 'له أربعة أضلاع وفيه ضلعان أطول', descEn: 'Has four sides with two longer sides' },
      { id: 'starshape', nameAr: 'نَجْمَةٌ', nameEn: 'Star', emoji: '⭐', descAr: 'شكل له رؤوس بارزة', descEn: 'A shape with points' },
      { id: 'heartshape', nameAr: 'قَلْبٌ', nameEn: 'Heart', emoji: '❤️', descAr: 'شكل يشبه القلب', descEn: 'A heart-shaped figure' },
      { id: 'oval', nameAr: 'بَيْضَاوِيٌّ', nameEn: 'Oval', emoji: '🥚', descAr: 'شكل مستدير وممتد', descEn: 'A stretched round shape' },
      { id: 'diamond', nameAr: 'مُعَيَّنٌ', nameEn: 'Diamond', emoji: '🔷', descAr: 'شكل له أربعة أضلاع', descEn: 'A four-sided shape' },
      // ——— إضافات ———
      { id: 'arrow', nameAr: 'سَهْمٌ', nameEn: 'Arrow', emoji: '➡️', descAr: 'يشير إلى اتجاه', descEn: 'It points to a direction' },
      { id: 'parallelogram', nameAr: 'مُتَوَازِي الأَضْلَاعِ', nameEn: 'Parallelogram', emoji: '🔶', descAr: 'له أربعة أضلاع متوازية', descEn: 'Four parallel sides' },
      { id: 'trapezoid', nameAr: 'شِبْهُ الْمُنْحَرِفِ', nameEn: 'Trapezoid', emoji: '🔻', descAr: 'له ضلعان متوازيان', descEn: 'Has two parallel sides' },
      { id: 'cube', nameAr: 'مُكَعَّبٌ', nameEn: 'Cube', emoji: '🧊', descAr: 'شكل ثلاثي الأبعاد', descEn: 'A 3D shape' },
    ],
  },

  // ——— 🌱 اكتشف النباتات ———
  {
    id: 'plants',
    titleAr: 'اكْتَشِفِ النَّبَاتَاتِ',
    titleEn: 'Discover Plants',
    emoji: '🌱',
    color: '#2fb68c',
    colorEnd: '#84cc16',
    sceneEmojis: ['🌱', '🌳', '🌸', '🍃'],
    items: [
      { id: 'plant', nameAr: 'نَبَاتٌ', nameEn: 'Plant', emoji: '🌱', descAr: 'ينمو ويحتاج إلى العناية', descEn: 'Grows and needs care' },
      { id: 'root', nameAr: 'جِذْرٌ', nameEn: 'Root', emoji: '🪴', descAr: 'يمتد تحت التربة ويساعد النبات', descEn: 'Grows in soil and helps the plant' },
      { id: 'stem', nameAr: 'سَاقٌ', nameEn: 'Stem', emoji: '🌿', descAr: 'يحمل الأوراق والأزهار', descEn: 'Supports leaves and flowers' },
      { id: 'leaf2', nameAr: 'وَرَقَةٌ', nameEn: 'Leaf', emoji: '🍃', descAr: 'جزء أخضر من النبات', descEn: 'A green part of a plant' },
      { id: 'flower2', nameAr: 'زَهْرَةٌ', nameEn: 'Flower', emoji: '🌸', descAr: 'قد تكون جميلة وملونة', descEn: 'Can be beautiful and colorful' },
      { id: 'fruit', nameAr: 'ثَمَرَةٌ', nameEn: 'Fruit', emoji: '🍎', descAr: 'تنمو على بعض النباتات', descEn: 'Grows on some plants' },
      { id: 'cactus', nameAr: 'صَبَّارٌ', nameEn: 'Cactus', emoji: '🌵', descAr: 'نبات يتحمل الجفاف', descEn: 'A plant that can tolerate dry conditions' },
      { id: 'palm', nameAr: 'نَخْلَةٌ', nameEn: 'Palm tree', emoji: '🌴', descAr: 'شجرة طويلة لها سعف', descEn: 'A tall tree with fronds' },
    ],
  },

  // ═══════════════════════════════════════════════
  // ——— ⏰ عالم الوقت (جديد) ———
  // ═══════════════════════════════════════════════
  {
    id: 'time',
    titleAr: 'اكْتَشِفِ الْوَقْتَ',
    titleEn: 'Discover Time',
    emoji: '⏰',
    color: '#8b5fbf',
    colorEnd: '#3aa0d9',
    sceneEmojis: ['⏰', '🕐', '📅', '🌅'],
    items: [
      // وحدات الوقت
      { id: 'second', nameAr: 'ثَانِيَةٌ', nameEn: 'Second', emoji: '⏱️', descAr: 'أصغر وحدة للوقت', descEn: 'The smallest time unit' },
      { id: 'minute', nameAr: 'دَقِيقَةٌ', nameEn: 'Minute', emoji: '⏲️', descAr: 'ستون ثانية', descEn: 'Sixty seconds' },
      { id: 'hour', nameAr: 'سَاعَةٌ', nameEn: 'Hour', emoji: '🕐', descAr: 'ستون دقيقة', descEn: 'Sixty minutes' },
      { id: 'day', nameAr: 'يَوْمٌ', nameEn: 'Day', emoji: '📆', descAr: 'أربع وعشرون ساعة', descEn: 'Twenty-four hours' },
      { id: 'week', nameAr: 'أُسْبُوعٌ', nameEn: 'Week', emoji: '🗓️', descAr: 'سبعة أيام', descEn: 'Seven days' },
      { id: 'month', nameAr: 'شَهْرٌ', nameEn: 'Month', emoji: '📅', descAr: 'حوالي ثلاثين يومًا', descEn: 'About thirty days' },
      { id: 'year', nameAr: 'سَنَةٌ', nameEn: 'Year', emoji: '🎆', descAr: 'اثنا عشر شهرًا', descEn: 'Twelve months' },
      // أوقات اليوم
      { id: 'morning', nameAr: 'صَبَاحٌ', nameEn: 'Morning', emoji: '🌅', descAr: 'بداية اليوم', descEn: 'Start of the day' },
      { id: 'noon', nameAr: 'ظُهْرٌ', nameEn: 'Noon', emoji: '🌞', descAr: 'منتصف النهار', descEn: 'Middle of the day' },
      { id: 'evening', nameAr: 'مَسَاءٌ', nameEn: 'Evening', emoji: '🌆', descAr: 'آخر النهار', descEn: 'End of the day' },
      { id: 'night', nameAr: 'لَيْلٌ', nameEn: 'Night', emoji: '🌙', descAr: 'وقت النوم والظلام', descEn: 'Time to sleep' },
      // مفاهيم الزمن
      { id: 'yesterday', nameAr: 'أَمْسِ', nameEn: 'Yesterday', emoji: '⬅️', descAr: 'اليوم السابق', descEn: 'The day before today' },
      { id: 'today', nameAr: 'الْيَوْمَ', nameEn: 'Today', emoji: '⭐', descAr: 'اليوم الحالي', descEn: 'The current day' },
      { id: 'tomorrow', nameAr: 'غَدًا', nameEn: 'Tomorrow', emoji: '➡️', descAr: 'اليوم القادم', descEn: 'The day after today' },
      // أيام الأسبوع
      { id: 'saturday', nameAr: 'السَّبْتُ', nameEn: 'Saturday', emoji: '1️⃣', descAr: 'أول أيام الأسبوع', descEn: 'First day of the week' },
      { id: 'sunday', nameAr: 'الأَحَدُ', nameEn: 'Sunday', emoji: '2️⃣' },
      { id: 'monday', nameAr: 'الاثْنَيْنِ', nameEn: 'Monday', emoji: '3️⃣' },
      { id: 'tuesday', nameAr: 'الثُّلَاثَاءُ', nameEn: 'Tuesday', emoji: '4️⃣' },
      { id: 'wednesday', nameAr: 'الأَرْبِعَاءُ', nameEn: 'Wednesday', emoji: '5️⃣' },
      { id: 'thursday', nameAr: 'الْخَمِيسُ', nameEn: 'Thursday', emoji: '6️⃣' },
      { id: 'friday', nameAr: 'الْجُمْعَةُ', nameEn: 'Friday', emoji: '7️⃣', descAr: 'آخر أيام الأسبوع', descEn: 'Last day of the week' },
      // أدوات الوقت
      { id: 'clock2', nameAr: 'سَاعَةٌ', nameEn: 'Clock', emoji: '🕰️', descAr: 'نعرف بها الوقت', descEn: 'Tells us the time' },
      { id: 'watch2', nameAr: 'سَاعَةُ الْيَدِ', nameEn: 'Watch', emoji: '⌚', descAr: 'نلبسها في اليد', descEn: 'Worn on the wrist' },
      { id: 'calendar', nameAr: 'تَقْوِيمٌ', nameEn: 'Calendar', emoji: '📅', descAr: 'يعرض الأيام والشهور', descEn: 'Shows days and months' },
      { id: 'alarm', nameAr: 'مُنَبِّهٌ', nameEn: 'Alarm', emoji: '⏰', descAr: 'يوقظنا في الصباح', descEn: 'Wakes us up in the morning' },
      { id: 'sandglass', nameAr: 'سَاعَةٌ رَمْلِيَّةٌ', nameEn: 'Hourglass', emoji: '⏳', descAr: 'تقيس زمنًا قصيرًا', descEn: 'Measures a short time' },
    ],
  },

]

// ——— دوال مساعدة ———

export function getWorldById(id: string): DiscoverWorld | undefined {
  return DISCOVER_WORLDS.find((w) => w.id === id)
}

export function getItemById(worldId: string, itemId: string): DiscoverItem | undefined {
  return getWorldById(worldId)?.items.find((i) => i.id === itemId)
}

export function getRandomItemsExcept(
  correct: DiscoverItem,
  worldId: string,
  count: number
): DiscoverItem[] {
  const world = getWorldById(worldId)
  if (!world) return []
  const others = world.items.filter((i) => i.id !== correct.id)
  return others.sort(() => Math.random() - 0.5).slice(0, count)
}
