import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Get the main chat page, optionally with a specific chat open
// @route   GET /chats
// @route   GET /chats/:userId
export const getChatsPage = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;

        // 1. Fetch all conversations for the sidebar
        const conversations = await Conversation.find({ participants: currentUserId })
            .populate({
                path: 'participants',
                select: 'displayName profileImage isVerified',
                match: { _id: { $ne: currentUserId } }
            })
            .sort({ updatedAt: -1 })
            .lean();

        // Re-format conversations to be more usable in the new template
        const processedConversations = conversations.map(convo => {
            if (!convo.participants || convo.participants.length === 0) return null;
            return {
                _id: convo.participants[0]._id, // otherUser._id for the link
                conversationId: convo._id,
                otherUser: convo.participants[0],
                lastMessage: convo.lastMessage || 'No messages yet.',
                updatedAt: convo.updatedAt
            };
        }).filter(Boolean); // Filter out any null entries

        const renderData = {
            title: 'Chats',
            layout: 'layouts/main_v2',
            user: req.user,
            conversations: processedConversations,
            activeChat: null
        };

        // 2. If a specific chat is requested, fetch its details
        if (otherUserId) {
            const otherUser = await User.findById(otherUserId).lean();
            if (!otherUser) {
                req.flash('error_msg', 'User not found.');
                return res.redirect('/chats');
            }

            let conversation = await Conversation.findOne({
                participants: { $all: [currentUserId, otherUserId] }
            });

            if (!conversation) {
                conversation = new Conversation({ participants: [currentUserId, otherUserId] });
                await conversation.save();
            }

            const messages = await Message.find({ conversationId: conversation._id })
                .populate('sender', 'displayName profileImage')
                .sort({ createdAt: 'asc' })
                .lean();

            renderData.title = `Chat with ${otherUser.displayName}`;
            renderData.activeChat = {
                otherUser: otherUser,
                conversationId: conversation._id,
                messages: messages
            };
        }

        res.render('chats_v3', renderData);

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'There was an error loading the chat page.');
        res.redirect('/discover');
    }
};

// @desc    Handle image uploads in a chat
// @route   POST /chats/upload-image
export const uploadChatImage = async (req, res) => {
    try {
        const { conversationId, senderId } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        const message = new Message({
            conversationId,
            sender: senderId,
            messageType: 'image',
            content: req.file.path, // The URL from Cloudinary
        });
        await message.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'displayName profileImage')
            .lean();

        // Emit the message to the specific chat room using the global io instance
        req.app.get('io').to(conversationId).emit('message', populatedMessage);

        // Update the last message preview for the conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: 'Image 📷',
            updatedAt: Date.now(),
        });

        res.status(200).json({ success: true, message: populatedMessage });

    } catch (err) {
        console.error('Chat image upload error:', err);
        res.status(500).json({ error: 'Server error during image upload.' });
    }
};