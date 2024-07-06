const nodemailer=require("nodemailer")
const userCollection=require("../../models/usermodel")

//  Nodemailer
let otp = Math.floor(1000 + Math.random() * 9000).toString();

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'fito.kripp@gmail.com', 
        pass: 'fosl sufc afif evrx'   
    }
});

// post
const signuppost = async (req, res) => {
    try {
        const { name, email, phone, password, checkbox } = req.body;

        // Check if user already exists
        const existingUser = await userCollection.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Send OTP email
        sendOtpEmail(email);
        res.status(200).send('OTP sent');
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

const sendOtpEmail = (email) => {
    otp = Math.floor(1000 + Math.random() * 9000).toString();
    const mailOptions = {
        from: 'fito.kripp@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
const sotp = async (req, res) => {
    const { enteredOtp, name, email, phone, password, checkbox } = req.body;
    if (enteredOtp === otp) {
        try {
            const data = {
                name: name,
                email: email,
                phone: phone,
                password: password,
                checkbox: checkbox
            };

            // Check if user already exists
            const existingUser = await userCollection.findOne({ email: email });
            if (existingUser) {
                return res.status(400).send('User already exists');
            }

            // Register the user
            await userCollection.insertMany(data);
            res.status(200).send('User registered successfully');
        } catch (error) {
            console.log(error);
            res.status(500).send('Server error');
        }
    } else {
        res.status(400).send('Invalid OTP');
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;
    sendOtpEmail(email);
    res.status(200).send('OTP resent');
};

module.exports={
    signuppost,sotp,resendOtp
}