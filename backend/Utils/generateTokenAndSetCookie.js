import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (userId, res) => {
    try {
        const token = jwt.sign({userId},process.env.JWT_TOKEN,{
            expiresIn: '15d',
        })

        res.cookie('jwt',token,{
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        })
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}