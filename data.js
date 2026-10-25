/* Seed content for Pantry & Plan. Plain global, no build step. */
window.MEAL_DATA = (function () {
  const DAYS = [
    { key: 'mon', short: 'Mon', label: 'Monday' },
    { key: 'tue', short: 'Tue', label: 'Tuesday' },
    { key: 'wed', short: 'Wed', label: 'Wednesday' },
    { key: 'thu', short: 'Thu', label: 'Thursday' },
    { key: 'fri', short: 'Fri', label: 'Friday' },
    { key: 'sat', short: 'Sat', label: 'Saturday' },
    { key: 'sun', short: 'Sun', label: 'Sunday' }
  ];

  const MEALS = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snack', label: 'Snack' }
  ];

  const AISLES = [
    { key: 'Produce', icon: '🥬' },
    { key: 'Protein', icon: '🥩' },
    { key: 'Dairy & Eggs', icon: '🥛' },
    { key: 'Bakery', icon: '🥖' },
    { key: 'Pantry', icon: '🫙' },
    { key: 'Spices', icon: '🧂' },
    { key: 'Frozen', icon: '❄️' },
    { key: 'Other', icon: '🧺' }
  ];

  const UNITS = ['g', 'ml', 'tbsp', 'tsp', 'piece', 'clove', 'slice', 'can', 'sprig', 'pinch', 'bunch'];

  const TAGS = {
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    'high-protein': 'High protein',
    quick: 'Quick (≤20 min)',
    'gluten-free': 'Gluten-free',
    'meal-prep': 'Meal prep'
  };

  const RECIPES = [
    {
      id: 'overnight-berry-oats',
      title: 'Overnight Berry Oats',
      emoji: '🫐',
      description: 'Creamy make-ahead oats layered with yogurt, chia and juicy blueberries.',
      types: ['breakfast'],
      tags: ['vegetarian', 'meal-prep', 'quick'],
      minutes: 10,
      servings: 2,
      nutrition: { calories: 380, protein: 18, carbs: 52, fat: 11 },
      ingredients: [
        { name: 'rolled oats', qty: 80, unit: 'g', aisle: 'Pantry' },
        { name: 'milk', qty: 300, unit: 'ml', aisle: 'Dairy & Eggs' },
        { name: 'greek yogurt', qty: 150, unit: 'g', aisle: 'Dairy & Eggs' },
        { name: 'blueberries', qty: 100, unit: 'g', aisle: 'Produce' },
        { name: 'honey', qty: 2, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'chia seeds', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'vanilla extract', qty: 1, unit: 'tsp', aisle: 'Pantry' }
      ],
      steps: [
        'Stir the oats, milk, yogurt, chia seeds and vanilla together in a bowl.',
        'Sweeten with honey, then fold through half of the blueberries.',
        'Divide between two jars, cover and chill overnight (or for at least 4 hours).',
        'Top with the remaining berries just before serving.'
      ]
    },
    {
      id: 'avocado-egg-toast',
      title: 'Avocado & Egg Toast',
      emoji: '🥑',
      description: 'Golden sourdough, smashed avocado and a jammy fried egg with chilli flakes.',
      types: ['breakfast'],
      tags: ['vegetarian', 'quick', 'high-protein'],
      minutes: 15,
      servings: 2,
      nutrition: { calories: 430, protein: 19, carbs: 38, fat: 24 },
      ingredients: [
        { name: 'sourdough bread', qty: 2, unit: 'slice', aisle: 'Bakery' },
        { name: 'avocado', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'egg', qty: 2, unit: 'piece', aisle: 'Dairy & Eggs' },
        { name: 'lemon juice', qty: 1, unit: 'tsp', aisle: 'Produce' },
        { name: 'olive oil', qty: 1, unit: 'tsp', aisle: 'Pantry' },
        { name: 'chilli flakes', qty: 1, unit: 'pinch', aisle: 'Spices' },
        { name: 'salt', qty: 1, unit: 'pinch', aisle: 'Spices' },
        { name: 'black pepper', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Toast the sourdough until crisp and golden.',
        'Mash the avocado with lemon juice, salt and pepper.',
        'Fry the eggs in olive oil to your liking.',
        'Pile the avocado onto the toast, top with the eggs and scatter over chilli flakes.'
      ]
    },
    {
      id: 'spinach-feta-omelette',
      title: 'Spinach & Feta Omelette',
      emoji: '🍳',
      description: 'A soft three-egg omelette folded around wilted spinach and salty feta.',
      types: ['breakfast'],
      tags: ['vegetarian', 'high-protein', 'quick', 'gluten-free'],
      minutes: 12,
      servings: 2,
      nutrition: { calories: 360, protein: 24, carbs: 6, fat: 27 },
      ingredients: [
        { name: 'egg', qty: 3, unit: 'piece', aisle: 'Dairy & Eggs' },
        { name: 'spinach', qty: 60, unit: 'g', aisle: 'Produce' },
        { name: 'feta', qty: 40, unit: 'g', aisle: 'Dairy & Eggs' },
        { name: 'butter', qty: 1, unit: 'tsp', aisle: 'Dairy & Eggs' },
        { name: 'black pepper', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Whisk the eggs with a pinch of black pepper.',
        'Melt the butter in a non-stick pan and wilt the spinach for 1 minute.',
        'Pour in the eggs, scatter over the feta and cook gently until just set.',
        'Fold the omelette in half and slide onto a warm plate.'
      ]
    },
    {
      id: 'banana-protein-pancakes',
      title: 'Banana Protein Pancakes',
      emoji: '🥞',
      description: 'Fluffy blender pancakes made with oats, banana and a scoop of protein.',
      types: ['breakfast'],
      tags: ['vegetarian', 'high-protein'],
      minutes: 20,
      servings: 2,
      nutrition: { calories: 470, protein: 31, carbs: 52, fat: 15 },
      ingredients: [
        { name: 'banana', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'rolled oats', qty: 60, unit: 'g', aisle: 'Pantry' },
        { name: 'egg', qty: 2, unit: 'piece', aisle: 'Dairy & Eggs' },
        { name: 'protein powder', qty: 30, unit: 'g', aisle: 'Pantry' },
        { name: 'baking powder', qty: 1, unit: 'tsp', aisle: 'Pantry' },
        { name: 'milk', qty: 60, unit: 'ml', aisle: 'Dairy & Eggs' },
        { name: 'maple syrup', qty: 2, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'butter', qty: 1, unit: 'tsp', aisle: 'Dairy & Eggs' }
      ],
      steps: [
        'Blend the oats, banana, eggs, protein powder, baking powder and milk until smooth.',
        'Rest the batter for 5 minutes so it thickens.',
        'Cook small ladlefuls in a buttered pan over medium heat, about 2 minutes per side.',
        'Stack the pancakes and finish with maple syrup.'
      ]
    },
    {
      id: 'chicken-quinoa-bowl',
      title: 'Chicken & Quinoa Bowl',
      emoji: '🥗',
      description: 'Seared chicken, fluffy quinoa and crunchy veg with a lemon olive oil dressing.',
      types: ['lunch', 'dinner'],
      tags: ['high-protein', 'gluten-free', 'meal-prep'],
      minutes: 25,
      servings: 2,
      nutrition: { calories: 560, protein: 42, carbs: 44, fat: 23 },
      ingredients: [
        { name: 'chicken breast', qty: 300, unit: 'g', aisle: 'Protein' },
        { name: 'quinoa', qty: 120, unit: 'g', aisle: 'Pantry' },
        { name: 'cucumber', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'cherry tomato', qty: 150, unit: 'g', aisle: 'Produce' },
        { name: 'avocado', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'feta', qty: 40, unit: 'g', aisle: 'Dairy & Eggs' },
        { name: 'olive oil', qty: 2, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'lemon', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'salt', qty: 1, unit: 'pinch', aisle: 'Spices' },
        { name: 'black pepper', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Rinse the quinoa and simmer in twice its volume of water for 15 minutes.',
        'Season the chicken and sear in a hot pan for 5–6 minutes per side, then rest and slice.',
        'Chop the cucumber, tomatoes and avocado.',
        'Whisk the olive oil with lemon juice, salt and pepper, then toss everything together.'
      ]
    },
    {
      id: 'mediterranean-chickpea-salad',
      title: 'Mediterranean Chickpea Salad',
      emoji: '🥙',
      description: 'Crisp vegetables, olives and chickpeas tossed in a bright lemon dressing.',
      types: ['lunch'],
      tags: ['vegan', 'gluten-free', 'quick', 'meal-prep'],
      minutes: 15,
      servings: 2,
      nutrition: { calories: 430, protein: 15, carbs: 42, fat: 24 },
      ingredients: [
        { name: 'chickpeas', qty: 1, unit: 'can', aisle: 'Pantry' },
        { name: 'cucumber', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'tomato', qty: 200, unit: 'g', aisle: 'Produce' },
        { name: 'red onion', qty: 0.5, unit: 'piece', aisle: 'Produce' },
        { name: 'parsley', qty: 20, unit: 'g', aisle: 'Produce' },
        { name: 'kalamata olives', qty: 60, unit: 'g', aisle: 'Pantry' },
        { name: 'olive oil', qty: 3, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'lemon', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'salt', qty: 1, unit: 'pinch', aisle: 'Spices' },
        { name: 'black pepper', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Drain and rinse the chickpeas.',
        'Dice the cucumber and tomatoes, thinly slice the onion and chop the parsley.',
        'Whisk the olive oil with the juice of the lemon, salt and pepper.',
        'Toss everything with the olives and let it sit for 10 minutes before serving.'
      ]
    },
    {
      id: 'turkey-pesto-wrap',
      title: 'Turkey Pesto Wrap',
      emoji: '🌯',
      description: 'A five-minute lunch of toasted wraps, pesto, turkey and melting mozzarella.',
      types: ['lunch'],
      tags: ['quick', 'high-protein'],
      minutes: 10,
      servings: 2,
      nutrition: { calories: 480, protein: 34, carbs: 40, fat: 20 },
      ingredients: [
        { name: 'tortilla wrap', qty: 2, unit: 'piece', aisle: 'Bakery' },
        { name: 'turkey breast', qty: 120, unit: 'g', aisle: 'Protein' },
        { name: 'basil pesto', qty: 2, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'mozzarella', qty: 60, unit: 'g', aisle: 'Dairy & Eggs' },
        { name: 'spinach', qty: 40, unit: 'g', aisle: 'Produce' },
        { name: 'tomato', qty: 1, unit: 'piece', aisle: 'Produce' }
      ],
      steps: [
        'Spread each wrap with pesto.',
        'Layer on the turkey, mozzarella, spinach and sliced tomato.',
        'Roll tightly, then toast in a dry pan for 1–2 minutes per side.',
        'Slice in half and serve warm.'
      ]
    },
    {
      id: 'miso-salmon-rice-bowl',
      title: 'Miso Salmon Rice Bowl',
      emoji: '🍣',
      description: 'Glazed miso salmon over rice with edamame, cucumber and sesame.',
      types: ['dinner'],
      tags: ['high-protein', 'gluten-free'],
      minutes: 30,
      servings: 2,
      nutrition: { calories: 610, protein: 38, carbs: 58, fat: 25 },
      ingredients: [
        { name: 'salmon fillet', qty: 300, unit: 'g', aisle: 'Protein' },
        { name: 'jasmine rice', qty: 150, unit: 'g', aisle: 'Pantry' },
        { name: 'white miso', qty: 2, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'soy sauce', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'honey', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'edamame', qty: 150, unit: 'g', aisle: 'Frozen' },
        { name: 'cucumber', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'spring onion', qty: 2, unit: 'piece', aisle: 'Produce' },
        { name: 'sesame seeds', qty: 1, unit: 'tsp', aisle: 'Pantry' }
      ],
      steps: [
        'Heat the oven to 200°C and cook the rice according to the packet.',
        'Mix the miso, soy sauce and honey, then brush over the salmon.',
        'Bake the salmon for 12–15 minutes until just cooked.',
        'Blanch the edamame, slice the cucumber and build the bowls with sesame and spring onion.'
      ]
    },
    {
      id: 'creamy-tomato-pasta',
      title: 'Creamy Tomato Pasta',
      emoji: '🍝',
      description: 'Silky tomato and parmesan sauce clinging to spaghetti. A weeknight hero.',
      types: ['dinner'],
      tags: ['vegetarian'],
      minutes: 25,
      servings: 2,
      nutrition: { calories: 590, protein: 20, carbs: 76, fat: 24 },
      ingredients: [
        { name: 'spaghetti', qty: 250, unit: 'g', aisle: 'Pantry' },
        { name: 'canned tomatoes', qty: 1, unit: 'can', aisle: 'Pantry' },
        { name: 'garlic', qty: 3, unit: 'clove', aisle: 'Produce' },
        { name: 'onion', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'heavy cream', qty: 100, unit: 'ml', aisle: 'Dairy & Eggs' },
        { name: 'parmesan', qty: 40, unit: 'g', aisle: 'Dairy & Eggs' },
        { name: 'fresh basil', qty: 10, unit: 'g', aisle: 'Produce' },
        { name: 'olive oil', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'salt', qty: 1, unit: 'pinch', aisle: 'Spices' },
        { name: 'black pepper', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Cook the spaghetti in well-salted water until al dente.',
        'Soften the onion and garlic in olive oil, then add the tomatoes and simmer for 10 minutes.',
        'Stir in the cream and parmesan until glossy.',
        'Toss the pasta through the sauce with a splash of pasta water and finish with basil.'
      ]
    },
    {
      id: 'sheet-pan-chicken-veg',
      title: 'Sheet-Pan Chicken & Veg',
      emoji: '🍗',
      description: 'Golden chicken thighs and roast vegetables on one tray. Minimal washing up.',
      types: ['dinner'],
      tags: ['high-protein', 'gluten-free', 'meal-prep'],
      minutes: 40,
      servings: 2,
      nutrition: { calories: 550, protein: 38, carbs: 38, fat: 28 },
      ingredients: [
        { name: 'chicken thigh', qty: 600, unit: 'g', aisle: 'Protein' },
        { name: 'baby potato', qty: 500, unit: 'g', aisle: 'Produce' },
        { name: 'carrot', qty: 3, unit: 'piece', aisle: 'Produce' },
        { name: 'broccoli', qty: 300, unit: 'g', aisle: 'Produce' },
        { name: 'olive oil', qty: 3, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'rosemary', qty: 2, unit: 'sprig', aisle: 'Produce' },
        { name: 'garlic', qty: 4, unit: 'clove', aisle: 'Produce' },
        { name: 'lemon', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'salt', qty: 1, unit: 'pinch', aisle: 'Spices' },
        { name: 'black pepper', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Heat the oven to 220°C.',
        'Toss the potatoes, carrots, garlic and rosemary with olive oil, salt and pepper and roast for 15 minutes.',
        'Add the chicken thighs and broccoli, drizzle with a little more oil and roast for 20–25 minutes.',
        'Squeeze over the lemon and serve straight from the tray.'
      ]
    },
    {
      id: 'lentil-coconut-curry',
      title: 'Lentil Coconut Curry',
      emoji: '🍛',
      description: 'A creamy, gently spiced red lentil curry that tastes even better the next day.',
      types: ['dinner'],
      tags: ['vegan', 'gluten-free', 'meal-prep'],
      minutes: 35,
      servings: 2,
      nutrition: { calories: 470, protein: 19, carbs: 62, fat: 18 },
      ingredients: [
        { name: 'red lentils', qty: 200, unit: 'g', aisle: 'Pantry' },
        { name: 'coconut milk', qty: 1, unit: 'can', aisle: 'Pantry' },
        { name: 'onion', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'garlic', qty: 3, unit: 'clove', aisle: 'Produce' },
        { name: 'ginger', qty: 20, unit: 'g', aisle: 'Produce' },
        { name: 'curry powder', qty: 2, unit: 'tbsp', aisle: 'Spices' },
        { name: 'canned tomatoes', qty: 1, unit: 'can', aisle: 'Pantry' },
        { name: 'spinach', qty: 100, unit: 'g', aisle: 'Produce' },
        { name: 'basmati rice', qty: 150, unit: 'g', aisle: 'Pantry' },
        { name: 'olive oil', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'salt', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Cook the rice according to the packet.',
        'Soften the onion in olive oil, then add the garlic, ginger and curry powder for 1 minute.',
        'Add the lentils, tomatoes, coconut milk and 300 ml water. Simmer for 20 minutes.',
        'Stir through the spinach until wilted and serve with the rice.'
      ]
    },
    {
      id: 'beef-broccoli-stir-fry',
      title: 'Beef & Broccoli Stir-Fry',
      emoji: '🥦',
      description: 'Sticky ginger-soy beef with crisp broccoli, faster than takeaway.',
      types: ['dinner'],
      tags: ['high-protein'],
      minutes: 25,
      servings: 2,
      nutrition: { calories: 520, protein: 36, carbs: 48, fat: 20 },
      ingredients: [
        { name: 'flank steak', qty: 400, unit: 'g', aisle: 'Protein' },
        { name: 'broccoli', qty: 400, unit: 'g', aisle: 'Produce' },
        { name: 'soy sauce', qty: 3, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'ginger', qty: 15, unit: 'g', aisle: 'Produce' },
        { name: 'garlic', qty: 3, unit: 'clove', aisle: 'Produce' },
        { name: 'honey', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'cornstarch', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'sesame oil', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'jasmine rice', qty: 150, unit: 'g', aisle: 'Pantry' }
      ],
      steps: [
        'Cook the rice according to the packet.',
        'Slice the steak thinly and toss with the cornstarch.',
        'Sear the beef in a very hot pan, then set aside. Stir-fry the broccoli for 3 minutes.',
        'Add the ginger and garlic, then the soy sauce and honey. Return the beef to the pan and serve.'
      ]
    },
    {
      id: 'crispy-chickpeas',
      title: 'Crispy Smoked Paprika Chickpeas',
      emoji: '🫘',
      description: 'Crunchy roasted chickpeas with smoked paprika. Dangerously snackable.',
      types: ['snack'],
      tags: ['vegan', 'gluten-free', 'quick'],
      minutes: 20,
      servings: 2,
      nutrition: { calories: 190, protein: 8, carbs: 24, fat: 8 },
      ingredients: [
        { name: 'chickpeas', qty: 1, unit: 'can', aisle: 'Pantry' },
        { name: 'olive oil', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'smoked paprika', qty: 1, unit: 'tsp', aisle: 'Spices' },
        { name: 'ground cumin', qty: 1, unit: 'tsp', aisle: 'Spices' },
        { name: 'salt', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Heat the oven to 200°C. Drain, rinse and thoroughly dry the chickpeas.',
        'Toss with olive oil, paprika, cumin and salt.',
        'Spread on a tray and roast for 20–25 minutes, shaking halfway.',
        'Cool for 5 minutes so they crisp up before eating.'
      ]
    },
    {
      id: 'greek-yogurt-berry-bowl',
      title: 'Greek Yogurt Berry Bowl',
      emoji: '🍓',
      description: 'Thick yogurt, berries and crunchy granola with a thread of honey.',
      types: ['snack'],
      tags: ['vegetarian', 'high-protein', 'quick', 'gluten-free'],
      minutes: 5,
      servings: 2,
      nutrition: { calories: 230, protein: 17, carbs: 27, fat: 6 },
      ingredients: [
        { name: 'greek yogurt', qty: 200, unit: 'g', aisle: 'Dairy & Eggs' },
        { name: 'mixed berries', qty: 100, unit: 'g', aisle: 'Frozen' },
        { name: 'granola', qty: 30, unit: 'g', aisle: 'Pantry' },
        { name: 'honey', qty: 1, unit: 'tsp', aisle: 'Pantry' }
      ],
      steps: [
        'Spoon the yogurt into two bowls.',
        'Top with berries and a sprinkle of granola.',
        'Finish with a little honey.'
      ]
    },
    {
      id: 'hummus-veggie-plate',
      title: 'Hummus & Veggie Plate',
      emoji: '🥕',
      description: 'Swirled hummus with crunchy raw vegetables and a dusting of paprika.',
      types: ['snack'],
      tags: ['vegan', 'quick', 'gluten-free'],
      minutes: 10,
      servings: 2,
      nutrition: { calories: 270, protein: 9, carbs: 28, fat: 14 },
      ingredients: [
        { name: 'hummus', qty: 150, unit: 'g', aisle: 'Dairy & Eggs' },
        { name: 'carrot', qty: 2, unit: 'piece', aisle: 'Produce' },
        { name: 'cucumber', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'bell pepper', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'olive oil', qty: 1, unit: 'tsp', aisle: 'Pantry' },
        { name: 'paprika', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Spoon the hummus into a shallow bowl and swirl with the back of a spoon.',
        'Cut the vegetables into sticks.',
        'Drizzle the hummus with olive oil and dust with paprika.'
      ]
    },
    {
      id: 'apple-almond-butter',
      title: 'Apple & Almond Butter',
      emoji: '🍎',
      description: 'Crisp apple slices with almond butter and a whisper of cinnamon.',
      types: ['snack'],
      tags: ['vegan', 'quick', 'gluten-free'],
      minutes: 5,
      servings: 2,
      nutrition: { calories: 210, protein: 5, carbs: 26, fat: 11 },
      ingredients: [
        { name: 'apple', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'almond butter', qty: 2, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'cinnamon', qty: 1, unit: 'pinch', aisle: 'Spices' }
      ],
      steps: [
        'Core the apple and cut into thin slices.',
        'Serve with almond butter for dipping and dust with cinnamon.'
      ]
    },
    {
      id: 'smoky-black-bean-tacos',
      title: 'Smoky Black Bean Tacos',
      emoji: '🌮',
      description: 'Smoky beans, avocado and lime piled into warm corn tortillas.',
      types: ['dinner'],
      tags: ['vegetarian', 'quick', 'gluten-free'],
      minutes: 20,
      servings: 2,
      nutrition: { calories: 480, protein: 17, carbs: 58, fat: 21 },
      ingredients: [
        { name: 'black beans', qty: 1, unit: 'can', aisle: 'Pantry' },
        { name: 'corn tortilla', qty: 4, unit: 'piece', aisle: 'Bakery' },
        { name: 'red onion', qty: 0.5, unit: 'piece', aisle: 'Produce' },
        { name: 'avocado', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'lime', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'coriander', qty: 15, unit: 'g', aisle: 'Produce' },
        { name: 'smoked paprika', qty: 1, unit: 'tsp', aisle: 'Spices' },
        { name: 'ground cumin', qty: 1, unit: 'tsp', aisle: 'Spices' },
        { name: 'olive oil', qty: 1, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'feta', qty: 40, unit: 'g', aisle: 'Dairy & Eggs' }
      ],
      steps: [
        'Soften the red onion in olive oil, then add the beans, paprika and cumin.',
        'Add a splash of water and simmer for 5 minutes, crushing a few beans for texture.',
        'Warm the tortillas in a dry pan.',
        'Fill with beans, avocado, crumbled feta, coriander and a squeeze of lime.'
      ]
    },
    {
      id: 'shrimp-zucchini-linguine',
      title: 'Shrimp & Zucchini Linguine',
      emoji: '🍤',
      description: 'Garlicky shrimp and ribbons of zucchini tossed through linguine.',
      types: ['dinner', 'lunch'],
      tags: ['high-protein'],
      minutes: 25,
      servings: 2,
      nutrition: { calories: 540, protein: 36, carbs: 62, fat: 16 },
      ingredients: [
        { name: 'shrimp', qty: 300, unit: 'g', aisle: 'Protein' },
        { name: 'linguine', qty: 200, unit: 'g', aisle: 'Pantry' },
        { name: 'zucchini', qty: 2, unit: 'piece', aisle: 'Produce' },
        { name: 'garlic', qty: 3, unit: 'clove', aisle: 'Produce' },
        { name: 'cherry tomato', qty: 150, unit: 'g', aisle: 'Produce' },
        { name: 'olive oil', qty: 2, unit: 'tbsp', aisle: 'Pantry' },
        { name: 'chilli flakes', qty: 1, unit: 'pinch', aisle: 'Spices' },
        { name: 'lemon', qty: 1, unit: 'piece', aisle: 'Produce' },
        { name: 'parsley', qty: 15, unit: 'g', aisle: 'Produce' }
      ],
      steps: [
        'Cook the linguine until al dente, reserving a mug of pasta water.',
        'Sauté the zucchini ribbons and garlic in olive oil for 3 minutes.',
        'Add the shrimp, cherry tomatoes and chilli flakes and cook until the shrimp turn pink.',
        'Toss with the pasta, lemon juice, parsley and a splash of pasta water.'
      ]
    }
  ];

  /* [slot, recipeId] pairs used to dress the first visit. */
  const PRESET_WEEK = [
    ['mon-breakfast', 'overnight-berry-oats'],
    ['mon-lunch', 'chicken-quinoa-bowl'],
    ['mon-dinner', 'creamy-tomato-pasta'],
    ['tue-breakfast', 'avocado-egg-toast'],
    ['tue-lunch', 'mediterranean-chickpea-salad'],
    ['tue-dinner', 'miso-salmon-rice-bowl'],
    ['tue-snack', 'hummus-veggie-plate'],
    ['wed-breakfast', 'spinach-feta-omelette'],
    ['wed-lunch', 'turkey-pesto-wrap'],
    ['wed-dinner', 'sheet-pan-chicken-veg'],
    ['wed-snack', 'crispy-chickpeas'],
    ['thu-breakfast', 'banana-protein-pancakes'],
    ['thu-lunch', 'chicken-quinoa-bowl'],
    ['thu-dinner', 'lentil-coconut-curry'],
    ['thu-snack', 'apple-almond-butter'],
    ['fri-breakfast', 'overnight-berry-oats'],
    ['fri-lunch', 'mediterranean-chickpea-salad'],
    ['fri-dinner', 'beef-broccoli-stir-fry'],
    ['fri-snack', 'greek-yogurt-berry-bowl'],
    ['sat-breakfast', 'banana-protein-pancakes'],
    ['sat-lunch', 'turkey-pesto-wrap'],
    ['sat-dinner', 'smoky-black-bean-tacos'],
    ['sat-snack', 'hummus-veggie-plate'],
    ['sun-breakfast', 'spinach-feta-omelette'],
    ['sun-lunch', 'shrimp-zucchini-linguine'],
    ['sun-dinner', 'sheet-pan-chicken-veg']
  ];

  return { DAYS, MEALS, AISLES, UNITS, TAGS, RECIPES, PRESET_WEEK };
})();
