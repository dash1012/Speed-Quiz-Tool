You are a senior full-stack developer and UI/UX designer.
Create a complete, production-ready web application named "Speed Quiz Tool".

TECH STACK
- Single HTML file only (index.html)
- Use HTML, CSS, Vanilla JavaScript only
- No external libraries or frameworks
- Data must persist using localStorage
- Must be ready to upload to GitHub and run without a server

DESIGN REQUIREMENTS
- Modern, clean, game-like UI
- Soft gradients, rounded cards, smooth animations
- Responsive (PC, tablet, mobile)
- Large buttons for touch use
- Smooth transitions between pages
- Countdown and score effects must feel dynamic

APP STRUCTURE
This app behaves like a mobile app but runs in browser.

--------------------------------
MAIN PAGE
--------------------------------
- Centered App Icon (generate simple icon using CSS)
- App Title: "Speed Quiz Tool"
- One button:
  [ Play ]

--------------------------------
QUIZ LIST PAGE
--------------------------------
- List of saved quizzes
- Each quiz card shows:
  - Quiz Title
  - Group count
  - Word count
- Buttons per quiz:
  [ Start ] [ Edit ] [ Delete ]
- Top buttons:
  [ + Create Quiz ]
  [ Back to Main ]

--------------------------------
ADMIN (CREATE / EDIT) PAGE
--------------------------------
Settings:
1. Quiz Title input (required)
2. Group count (1 ~ 10) [+] [-]
3. Words per group (1 ~ 40) [+] [-]
4. Group name inputs
   Example:
   Group 1: 재
   Group 2: 미
   Group 3: 있
   Group 4: 는
5. Word input area per group
   - Enter words separated by commas or line breaks
6. Time per quiz (seconds)
7. Pass limit per group

VALIDATION RULES
- All inputs must be filled
- Each group must have the correct number of words
- No empty words allowed
- Show alert if validation fails

Buttons:
[ Save Quiz ]
[ Cancel ]

--------------------------------
GROUP SELECT PAGE
--------------------------------
- Show combined group names as one sentence
- Show each group as a selectable card
- Already-played groups disappear

--------------------------------
QUIZ PLAY PAGE
--------------------------------
- 3 second countdown animation
- Center word display (large)
- Top:
  Remaining Time
- Bottom buttons:
  [ Correct ] [ Pass ] [ Wrong ]
- Correct increases score (+1)
- Pass decreases remaining pass count
- Auto move to next word
- When words end or time ends:
  - Show result
  - Return to group select

--------------------------------
FINAL RESULT PAGE
--------------------------------
- Show each group's score
- Rank groups by score
- Top 1~3:
  - Special animation
  - Gold / Silver / Bronze effect

--------------------------------
TIE BREAK SYSTEM
--------------------------------
If there is a tie in top 1~3:
- Show button:
  [ Bonus Round ]
- Bonus round:
  - Randomly select 2 tied groups
  - Use random words from all groups
  - Sudden death format
- If skipped:
  - Return to main page

--------------------------------
EXTRA FEATURES (IMPORTANT)
--------------------------------
- Dark / Light mode toggle
- Sound effects ON/OFF
- Fullscreen mode button
- Keyboard shortcuts:
  Space = Correct
  X = Wrong
  P = Pass
- Quiz duplication feature
- Export / Import quiz as JSON
- Reset all data button
- Animated progress bar
- Mobile vibration (if supported)

--------------------------------
CODE RULES
--------------------------------
- Everything in ONE HTML file
- Clear comments
- Modular JavaScript functions
- No unused code
- Must run immediately on open
- No console errors

OUTPUT
- Provide ONLY the complete index.html code
- No explanations
- No markdown
- No extra text