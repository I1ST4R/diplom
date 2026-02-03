const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'doctor', 'nurse'], 
    default: 'doctor' 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true
  },
  phone: { 
    type: String,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Обновляем updatedAt при каждом сохранении
UserSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('User', UserSchema);