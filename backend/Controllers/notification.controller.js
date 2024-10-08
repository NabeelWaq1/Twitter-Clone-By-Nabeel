import Notification from "../Models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({to: userId}).sort({createdAt: -1}).populate({
            path: 'from',
            select: 'profileImg username'
        });

        if(!notifications){
            return res.status(404).json({error: "No notifications found."});
        }
        
        res.status(200).json({notifications});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await Notification.deleteMany({to: userId});
        
        res.status(200).json({message: "All notifications deleted."});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}