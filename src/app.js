const express = require('express')
// const routes = require('./routes')
const cors = require('cors')

const app = express()
const errorMiddleware = require('./middleware/error.middleware')

app.use(cors())

app.use(express.json());

const User = require('./models/User');
const Book = require('./models/Book');
const ReadingProgress = require('./models/ReadingProgress');
const ReadingSession = require('./models/ReadingSession');
const Challenge = require('./models/Challenge');
const ChallengeProgress = require('./models/ChallengeProgress');
const Badge = require('./models/Badge');
const UserBadge = require('./models/UserBadge');
const Review = require('./models/Review');
const XPTransaction = require('./models/XPTransaction');

console.log('All ReadQuest models loaded successfully');

const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const readingRoutes = require('./routes/reading.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const streakRoutes = require('./routes/streak.routes');
const completionRoutes = require('./routes/completion.routes');
const badgeRoutes = require('./routes/badge.routes');
const challengeRoutes = require('./routes/challenge.routes');
const reviewRoutes = require('./routes/review.routes');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/gamification', gamificationRoutes)
app.use('/api/streak', streakRoutes);
app.use('/api/completion', completionRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/challenges', challengeRoutes)
app.use('/api/reviews', reviewRoutes)

app.get('/', (req, res)=> {
    res.send('api working')
})

app.use(errorMiddleware)

module.exports = app