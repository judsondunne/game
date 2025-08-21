# 🎮 Fictionary Game

A family word guessing game inspired by "Says Who" - perfect for 11 players!

## 🚀 How to Run

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 How to Play

### Game Setup

- **Players:** Exactly 11 family members
- **Goal:** Guess who has the real definition of unusual words
- **Duration:** Multiple rounds until you decide to stop

### Game Flow

1. **Login Phase** 📝

   - Each player enters their name
   - Game waits for all 11 players to join

2. **Role Assignment** 🎭

   - Among Us style role reveal
   - 3 Contestants (1 real, 2 bluffers)
   - 3 Judges (must agree on vote)
   - 5 Spectators (watch and enjoy)

3. **Word Display** 📖

   - Everyone sees the word and real definition briefly
   - Memorize for the round!

4. **Contestant Phase** ⏰

   - 30-second timer with background music
   - Real contestant sees actual definition
   - Bluffers create convincing fake definitions

5. **Voting Phase** ⚖️

   - Contestants read definitions aloud (put phones down!)
   - Judges vote for who they think is real
   - **IMPORTANT:** All 3 judges must agree!

6. **Results** 🎉

   - Real contestant reveals themselves
   - Points awarded based on success
   - Current standings displayed

7. **Next Round** 🔄
   - New roles assigned (different players)
   - New word selected
   - Rotation continues

### Scoring System

- **Correct Guess:** Judges +1 point each
- **Successful Bluff:** Real contestant +1 point
- **Fooled Judges:** Bluffers +1 point each (if voted for)
- **Wrong Guess:** Judges 0 points

### Role Rotation

- **Round 1:** 3 contestants, 3 judges, 5 spectators
- **Round 2:** Different 3 contestants, 3 judges, 5 spectators
- **Round 3:** Remaining players + crossover
- **Round 4+:** Continues rotation

## 🎨 Features

- ✨ Beautiful, modern UI with glassmorphism design
- 🎭 Among Us style role reveals
- ⏰ Built-in timers and countdowns
- 🎵 Background music prompts
- 📊 Real-time scoring and standings
- 🔄 Automatic role rotation
- 📱 Mobile-friendly design

## 🛠️ Technical Details

- **Frontend:** React with TypeScript
- **Styling:** CSS with glassmorphism effects
- **State Management:** React hooks
- **No Backend:** Pure frontend app
- **No Persistence:** Game state resets on refresh

## 🎯 Game Rules Summary

1. **11 players required** - no more, no less
2. **3 contestants per round** - 1 real, 2 bluffers
3. **3 judges per round** - must unanimously agree
4. **30-second preparation time** - with music!
5. **Judges must agree** - no split decisions allowed
6. **Role rotation** - everyone gets turns
7. **Points for cleverness** - bluffing and guessing

Perfect for family game nights! 🎉
