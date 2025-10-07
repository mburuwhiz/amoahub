import express from 'express';
import mongoose from 'mongoose';
import expressEjsLayouts from 'express-ejs-layouts';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import flash from 'connect-flash';

const app = express();

// Trust the first proxy, which is standard for services like Render.
// This allows req.protocol to correctly return 'https' and fixes the redirect_uri_mismatch error.
app.set('trust proxy', 1);

const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Attach Socket.IO
const PORT = process.env.PORT || 3000;

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main_v2');


// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    touchAfter: 24 * 3600, // time in seconds: 24 hours
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Flash middleware
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // For passport login failures
  res.locals.logout_success = req.flash('logout_success'); // For the custom logout notification
  next();
});

// Make io accessible to our router
app.set('io', io);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

import passportConfig from './config/passport.js';
import mainRoutes from './routes/main.js';
import authRoutes from './routes/auth.js';
import onboardingRoutes from './routes/onboarding.js';
import adminRoutes from './routes/admin.js';
import discoverRoutes from './routes/discover.js';
import usersRoutes from './routes/users.js';

// Passport config
passportConfig(passport);

// Routes
app.use('/', mainRoutes);
app.use('/', authRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/admin', adminRoutes);
app.use('/discover', discoverRoutes);
app.use('/users', usersRoutes);

import pagesRoutes from './routes/pages.js';
import chatRoutes from './routes/chat.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import photosRoutes from './routes/photos.js';
app.use('/', pagesRoutes);
app.use('/chats', chatRoutes);
app.use('/photos', photosRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinChat', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined chat room ${conversationId}`);
  });

  socket.on('chatMessage', async ({ conversationId, senderId, content }) => {
    if (!content) return;
    try {
      const message = new Message({
        conversationId,
        sender: senderId,
        content,
      });
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'displayName profileImage')
        .lean();

      io.to(conversationId).emit('message', populatedMessage);

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageAt: Date.now(),
      });
    } catch (err) {
      console.error('Socket.IO chatMessage error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 Page
app.use((req, res) => {
    res.status(404).render('error/404', { layout: false });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});