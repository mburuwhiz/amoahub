import Broadcast from '../models/Broadcast.js';

// @desc    Get a single broadcast message
// @route   GET /broadcasts/:id
export const getBroadcastMessage = async (req, res) => {
    try {
        const broadcast = await Broadcast.findById(req.params.id).lean();

        if (!broadcast) {
            req.flash('error_msg', 'Broadcast not found.');
            return res.redirect('/notifications');
        }

        res.render('broadcast', {
            title: 'Announcement',
            layout: 'layouts/main_v2',
            user: req.user,
            broadcast: broadcast,
        });

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Could not load the broadcast message.');
        res.redirect('/notifications');
    }
};