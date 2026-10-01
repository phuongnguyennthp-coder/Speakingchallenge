import { TeacherMaterial } from '../types';

export const DEFAULT_UNITS: TeacherMaterial[] = [
  {
    id: 'unit-5',
    unitNumber: 'Unit 5',
    unitTitle: 'What Would You Like to Be in the Future?',
    curriculumInfo: 'Tiếng Anh 5 Global Success – General Education Curriculum 2018',
    knowledgeContent: `Lesson Theme: Future dream jobs and workplaces.
Key Vocabulary:
- Jobs: teacher, doctor, pilot, artist, writer, engineer, nurse
- Workplaces: primary school, city hospital, airport, art studio
- Reasons: teach young children, take care of sick patients, fly big airplanes, draw beautiful pictures
Sentence Structures:
- "What would you like to be in the future?" -> "I would like to be a / an [job]."
- "Why would you like to be a [job]?" -> "Because I want to [activity]."
Transcript: Hello everyone, my name is Minh! Today, I want to talk about future jobs. In the future, I would like to be an English teacher because I want to help young children read and speak English. My friend Mai wants to be a doctor to take care of sick people in the hospital. My brother Nam would like to be a pilot because he loves flying big airplanes across the sky. And my friend Lan would like to be an artist because she loves drawing pictures of our country. What would you like to be in the future? Thank you for listening!`,
    backgroundType: 'preset',
    backgroundTheme: 'default',
    video: {
      sourceType: 'sample',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      caption: 'Model Presentation: Minh talking about future jobs (Teacher, Doctor, Pilot, Artist)',
      duration: '0:58',
      transcript: `Hello everyone, my name is Minh! Today, I want to talk about future jobs. In the future, I would like to be an English teacher because I want to help young children read and speak English. My friend Mai wants to be a doctor to take care of sick people in the hospital. My brother Nam would like to be a pilot because he loves flying big airplanes across the sky. And my friend Lan would like to be an artist because she loves drawing pictures of our country. What would you like to be in the future? Thank you for listening!`,
    },
    mindmap: {
      sourceType: 'diagram',
      url: '',
      title: 'Mindmap: My Future Dream Job',
      branches: [
        {
          id: 'b1',
          title: 'Future Jobs',
          color: 'emerald',
          iconName: 'Briefcase',
          items: ['Teacher', 'Doctor', 'Pilot', 'Artist'],
          simpleExplanation: 'This branch displays the four future jobs in our lesson: teacher, doctor, pilot, and artist.',
        },
        {
          id: 'b2',
          title: 'Workplaces',
          color: 'blue',
          iconName: 'Building',
          items: ['Primary School', 'City Hospital', 'Airport & Sky', 'Art Studio'],
          simpleExplanation: 'This branch shows where each person works: in a school, in a hospital, at an airport, or in an art studio.',
        },
        {
          id: 'b3',
          title: 'Reasons & Activities',
          color: 'amber',
          iconName: 'Heart',
          items: ['Teach young children', 'Take care of sick patients', 'Fly big airplanes', 'Draw beautiful paintings'],
          simpleExplanation: 'This branch gives the clear reasons: teaching kids, taking care of patients, flying planes, and painting.',
        },
        {
          id: 'b4',
          title: 'Key Sentence Patterns',
          color: 'purple',
          iconName: 'MessageSquare',
          items: [
            'What would you like to be in the future?',
            "I'd like to be a / an...",
            'Why would you like to be a...?',
            'Because I want to...',
          ],
          simpleExplanation: 'This branch presents the sentence patterns to ask and answer about dream jobs and reasons.',
        },
      ],
    },
    section1Questions: [
      {
        id: 's1_q1',
        question: 'What is the topic of the video / audio?',
        expectedHint: 'Future jobs / What would you like to be in the future',
        exampleAnswer: 'The topic is future jobs and dream careers.',
      },
      {
        id: 's1_q2',
        question: 'What jobs and workplaces can you hear in the presentation?',
        expectedHint: 'Teacher, doctor, pilot, artist, school, hospital, airport',
        exampleAnswer: 'I hear teacher, doctor, pilot, school, and hospital.',
      },
      {
        id: 's1_q3',
        question: 'What sentence pattern is used to explain the reason for a job choice?',
        expectedHint: 'Because I want to...',
        exampleAnswer: 'The speaker uses: "Because I want to help young children."',
      },
    ],
    section2Questions: [
      {
        id: 's2_q1',
        question: 'What information can you see in the mindmap?',
        expectedHint: 'Jobs, workplaces, reasons, and key sentence patterns',
        exampleAnswer: 'I can see 4 branches: future jobs, workplaces, reasons, and sentence patterns.',
      },
      {
        id: 's2_q2',
        question: 'Which idea do you want to talk about from the mindmap?',
        expectedHint: 'Any job like teacher, doctor, pilot, or school workplace',
        exampleAnswer: 'I want to talk about being an English teacher in a school.',
      },
    ],
    usefulExpressions: [
      {
        id: 'exp1',
        english: 'What would you like to be in the future?',
        vietnameseGuide: 'Bạn muốn làm nghề gì trong tương lai?',
        category: 'Greeting & Opening',
      },
      {
        id: 'exp2',
        english: 'I would like to be an English teacher.',
        vietnameseGuide: 'Mình muốn trở thành giáo viên tiếng Anh.',
        category: 'Expressing Dreams',
      },
      {
        id: 'exp3',
        english: "I'd like to work in a friendly primary school.",
        vietnameseGuide: 'Mình muốn làm việc ở một trường tiểu học thân thiện.',
        category: 'Expressing Dreams',
      },
      {
        id: 'exp4',
        english: 'Because I want to help children learn new words.',
        vietnameseGuide: 'Bởi vì mình muốn giúp các bạn nhỏ học từ mới.',
        category: 'Giving Reasons',
      },
      {
        id: 'exp5',
        english: 'Being a doctor is very helpful for sick people.',
        vietnameseGuide: 'Làm bác sĩ rất có ích cho những người bị ốm.',
        category: 'Giving Reasons',
      },
      {
        id: 'exp6',
        english: 'Thank you for listening to my presentation!',
        vietnameseGuide: 'Cảm ơn các bạn đã lắng nghe bài nói của mình!',
        category: 'Closing',
      },
    ],
    practiceLevels: [
      {
        levelNumber: 1,
        levelName: 'Recognition',
        badgeTitle: 'Level 1: Spot the Job',
        buddyPrompt: 'Hello friend! Look at the mindmap: Which of these jobs is listed on the mindmap? Is it "Teacher" or "Astronaut"?',
        options: ['Teacher', 'Astronaut'],
        sampleStudentAnswer: 'Teacher',
        hint: 'Say "Teacher" because it is clearly on the first branch of the mindmap.',
      },
      {
        levelNumber: 2,
        levelName: 'Short Answers',
        badgeTitle: 'Level 2: Quick Answer',
        buddyPrompt: 'Great job! Where does a doctor work according to our lesson and video?',
        sampleStudentAnswer: 'In a hospital.',
        hint: 'Say "In a hospital" or "At the city hospital".',
      },
      {
        levelNumber: 3,
        levelName: 'Extended Answers',
        badgeTitle: 'Level 3: Give a Reason',
        buddyPrompt: 'Super! Why would Minh like to be an English teacher in the presentation?',
        sampleStudentAnswer: 'Because he wants to help young children read and speak English.',
        hint: 'Use "Because he wants to..." and mention teaching children.',
      },
      {
        levelNumber: 4,
        levelName: 'Personal Opinion',
        badgeTitle: 'Level 4: Your Dream',
        buddyPrompt: 'Now, tell me about yourself! What would you like to be in the future, and why?',
        sampleStudentAnswer: "I'd like to be a doctor because I want to take care of sick people.",
        hint: 'Use "I would like to be a..." and give your personal reason with "because".',
      },
    ],
    modelAnswer: `Hello everyone! Today, I am very happy to talk about my future dream job. In the future, I would like to be an English teacher. I want to work in a lovely primary school in my hometown. I want to teach English to young children because learning English is fun and exciting. I practice speaking English every day so I can achieve my dream. What would you like to be in the future? Thank you for listening!`,
  },
  {
    id: 'unit-8',
    unitNumber: 'Unit 8',
    unitTitle: 'What Will the Weather Be Like Tomorrow?',
    curriculumInfo: 'Tiếng Anh 5 Global Success – General Education Curriculum 2018',
    knowledgeContent: `Lesson Theme: Seasons and weather conditions in Vietnam.
Key Vocabulary:
- Seasons: spring, summer, autumn, winter
- Weather words: warm, hot, sunny, cool, breezy, cold, dry, rainy
- Activities: go for a walk in the park, ride a bicycle, fly a kite, swim in the sea
Sentence Patterns:
- "What is your favourite season?" -> "My favourite season is [season]."
- "Why do you like it?" -> "Because the weather is [weather] and I can [activity]."
Transcript: Good morning teacher and friends! My name is Linh. Today, I want to talk about my favourite season. In Vietnam, there are four seasons in the north: spring, summer, autumn, and winter. My favourite season is autumn because the weather is cool and breezy. In autumn, I can go for a walk in the park with my family and ride my bicycle. I love autumn because the leaves turn golden and yellow. What is your favourite season? Thank you for listening!`,
    backgroundType: 'preset',
    backgroundTheme: 'sky',
    video: {
      sourceType: 'sample',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      caption: 'Model Presentation: Linh presenting about seasons and weather in Vietnam',
      duration: '0:50',
      transcript: `Good morning teacher and friends! My name is Linh. Today, I want to talk about my favourite season. In Vietnam, there are four seasons in the north: spring, summer, autumn, and winter. My favourite season is autumn because the weather is cool and breezy. In autumn, I can go for a walk in the park with my family and ride my bicycle. I love autumn because the leaves turn golden and yellow. What is your favourite season? Thank you for listening!`,
    },
    mindmap: {
      sourceType: 'diagram',
      url: '',
      title: 'Mindmap: Seasons & Weather in Vietnam',
      branches: [
        {
          id: 'b1',
          title: 'Four Seasons',
          color: 'emerald',
          iconName: 'Sun',
          items: ['Spring (warm & green)', 'Summer (hot & sunny)', 'Autumn (cool & breezy)', 'Winter (cold & windy)'],
          simpleExplanation: 'This branch displays the four seasons shown in the mindmap: spring, summer, autumn, and winter.',
        },
        {
          id: 'b2',
          title: 'Weather Conditions',
          color: 'blue',
          iconName: 'CloudRain',
          items: ['Sunny & warm', 'Cool & breezy', 'Cold & dry', 'Cloudy & rainy'],
          simpleExplanation: 'This branch presents the weather words: sunny, cool, breezy, cold, and rainy.',
        },
        {
          id: 'b3',
          title: 'Favourite Activities',
          color: 'amber',
          iconName: 'Smile',
          items: ['Going for a walk in the park', 'Riding a bicycle', 'Flying a kite', 'Drinking hot tea'],
          simpleExplanation: 'This branch shows seasonal activities: walking in the park, cycling, and flying kites.',
        },
        {
          id: 'b4',
          title: 'Sentence Patterns',
          color: 'purple',
          iconName: 'MessageSquare',
          items: [
            "What's the weather like in...?",
            'What is your favourite season?',
            'My favourite season is... because...',
          ],
          simpleExplanation: 'This branch shows the key patterns to ask about seasons and describe why you like them.',
        },
      ],
    },
    section1Questions: [
      {
        id: 's1_q1',
        question: 'What is the topic of the presentation?',
        expectedHint: 'My favourite season and the weather in Vietnam',
        exampleAnswer: 'The topic is seasons and weather in Vietnam.',
      },
      {
        id: 's1_q2',
        question: 'What weather words can you hear in the presentation?',
        expectedHint: 'Cool, breezy, sunny, warm, rainy',
        exampleAnswer: 'I hear cool, breezy, and warm weather.',
      },
      {
        id: 's1_q3',
        question: 'What activity does the speaker love doing in autumn?',
        expectedHint: 'Ride a bicycle and walk in the park',
        exampleAnswer: 'She loves riding her bicycle and walking in the park.',
      },
    ],
    section2Questions: [
      {
        id: 's2_q1',
        question: 'What information can you see in the mindmap?',
        expectedHint: 'Four seasons, weather conditions, activities, and sentence patterns',
        exampleAnswer: 'I can see four seasons, weather words, outdoor activities, and sentence patterns.',
      },
      {
        id: 's2_q2',
        question: 'Which idea do you want to talk about from the mindmap?',
        expectedHint: 'Autumn, summer, sunny weather, or riding a bicycle',
        exampleAnswer: 'I want to talk about autumn and riding my bicycle in cool weather.',
      },
    ],
    usefulExpressions: [
      {
        id: 'u8_exp1',
        english: 'What will the weather be like tomorrow?',
        vietnameseGuide: 'Thời tiết ngày mai sẽ như thế nào?',
        category: 'Greeting & Opening',
      },
      {
        id: 'u8_exp2',
        english: 'My favourite season is autumn.',
        vietnameseGuide: 'Mùa yêu thích nhất của mình là mùa thu.',
        category: 'Expressing Dreams',
      },
      {
        id: 'u8_exp3',
        english: 'The weather is usually cool, dry and breezy.',
        vietnameseGuide: 'Thời tiết thường mát mẻ, khô ráo và có gió nhẹ.',
        category: 'Expressing Dreams',
      },
      {
        id: 'u8_exp4',
        english: 'I love riding my bicycle in the park with my family.',
        vietnameseGuide: 'Mình thích đạp xe trong công viên cùng gia đình.',
        category: 'Giving Reasons',
      },
      {
        id: 'u8_exp5',
        english: 'Because the golden leaves look so beautiful.',
        vietnameseGuide: 'Bởi vì những chiếc lá vàng trông thật đẹp.',
        category: 'Giving Reasons',
      },
      {
        id: 'u8_exp6',
        english: 'Thank you for listening to my seasonal talk!',
        vietnameseGuide: 'Cảm ơn các bạn đã lắng nghe bài chia sẻ của mình!',
        category: 'Closing',
      },
    ],
    practiceLevels: [
      {
        levelNumber: 1,
        levelName: 'Recognition',
        badgeTitle: 'Level 1: Spot the Season',
        buddyPrompt: 'Which season has cool and breezy weather in the mindmap? Is it "Autumn" or "Winter"?',
        options: ['Autumn', 'Winter'],
        sampleStudentAnswer: 'Autumn',
        hint: 'Say "Autumn" because it is matched with cool and breezy weather.',
      },
      {
        levelNumber: 2,
        levelName: 'Short Answers',
        badgeTitle: 'Level 2: Quick Answer',
        buddyPrompt: 'What activity does Linh like to do in the park during autumn?',
        sampleStudentAnswer: 'Riding a bicycle and going for a walk.',
        hint: 'Say "Riding a bicycle" or "Going for a walk".',
      },
      {
        levelNumber: 3,
        levelName: 'Extended Answers',
        badgeTitle: 'Level 3: Give a Reason',
        buddyPrompt: 'Why does Linh like autumn the most in the presentation?',
        sampleStudentAnswer: 'Because the weather is cool and breezy, and the leaves turn yellow.',
        hint: 'Use "Because..." and describe the cool weather.',
      },
      {
        levelNumber: 4,
        levelName: 'Personal Opinion',
        badgeTitle: 'Level 4: Your Choice',
        buddyPrompt: 'What is YOUR favourite season, and what do you like doing in that season?',
        sampleStudentAnswer: 'My favourite season is summer because I can go swimming with my parents.',
        hint: 'Say your favourite season and give your reason.',
      },
    ],
    modelAnswer: `Hello everyone! Today, I want to talk about my favourite season. In Vietnam, there are four wonderful seasons, but I love autumn the most. In autumn, the weather is very cool, sunny and breezy. I like going to the green park near my house to ride my bicycle with my little brother. I also love looking at the golden trees. What season do you like best? Thank you for listening!`,
  },
];
