const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, errandId } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      errandId
    });

    const savedMessage = await newMessage.save();

    // Populate sender and recipient details for the response
    await savedMessage.populate('sender', 'name email photo');
    await savedMessage.populate('recipient', 'name email photo');

    // Emit message to recipient via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.to(recipientId).emit('newMessage', savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// Get messages between current user and another user
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The other user's ID
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
    .sort({ createdAt: 1 }) // Oldest first
    .populate('sender', 'name email photo')
    .populate('recipient', 'name email photo');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// Get all conversations for the current user (last message per user)
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Aggregate to find unique users interacted with and the last message
    // This is a simplified approach; for high scale, a separate Conversation model is better.
    // We'll find all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email photo')
    .populate('recipient', 'name email photo');

    const conversations = [];
    const seenUsers = new Set();

    for (const msg of messages) {
      // Skip messages where sender or recipient is missing (e.g. deleted users)
      if (!msg.sender || !msg.recipient) {
        continue;
      }

      const otherUser = msg.sender._id.toString() === currentUserId 
        ? msg.recipient 
        : msg.sender;
      
      const otherUserId = otherUser._id.toString();

      if (!seenUsers.has(otherUserId)) {
        seenUsers.add(otherUserId);
        conversations.push({
          user: otherUser,
          lastMessage: msg
        });
      }
    }

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};
