import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('📩 Login attempt:', email, password);

    const dbmail = await User.findOne({ email });
    if (!dbmail) {
      return res.status(401).json({ message: 'Authentication failed: User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, dbmail.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed: Incorrect password' });
    }

    const token = jwt.sign(
      { userId: dbmail._id, email: dbmail.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', email: dbmail.email, token });
    console.log('✅ Login successful for:', email);
    console.log('🔑 Generated JWT:', token);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const signupUser = (req: Request, res: Response) => {
  const {username, email, password } = req.body;
  console.log('📝 Signup attempt:', username,email, password);
    // hash the password before saving
  const hashedPassword = bcrypt.hashSync(password, 10);

   const newUser = new User({ username, email, password: hashedPassword });
    newUser.save();
    
    const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '1h' }
        );
        res.json({ message: 'Signup successful', email: newUser.email, token });



  res.json({ message: 'User registered successfully', email });
};
