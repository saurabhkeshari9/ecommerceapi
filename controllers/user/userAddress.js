const Address = require('../../models/useraddress.model');
const User = require('../../models/user.model'); // User model import

// Add New Address
exports.addAddress = async (req, res) => {
    try {
        const { name, mobile, street, city, state, postalCode } = req.body;

        const user = await User.findOne({ _id: req.userAuth, isDeleted: false });
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User account is deleted or blocked." });
        }

        const newAddress = await Address.create({
            userId: req.userAuth.id,
            name,
            mobile,
            street,
            city,
            state,
            postalCode
        });

        return res.status(200).json({ statusCode: 200, message: "Address added successfully", data: newAddress });
    } catch (err) {
        return res.status(500).json({ statusCode: 500, message: err.message });
    }
};


//  Get All Addresses
exports.getAllAddresses = async (req, res) => {
    try {
        let { limit = 10, offset = 0 } = req.query;
        limit = parseInt(limit);
        offset = parseInt(offset);

        // Check if user exists and is not deleted
        const user = await User.findOne({ _id: req.userAuth._id, isDeleted: false }).lean();
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User account is deleted or blocked." });
        }

        // Define filter
        let filter = { userId: req.userAuth._id, isDeleted: false };

        // Get total addresses count
        const totalAddresses = await Address.countDocuments(filter);

        // Fetch addresses with offset-based pagination
        const addresses = await Address.find(filter)
            .sort({ createdAt: -1 }) // Latest first
            .skip(offset) //  Using offset instead of page
            .limit(limit)
            .select("-updatedAt -__v") // Exclude unnecessary fields
            .lean();

        if (!addresses.length) {
            return res.status(400).json({ statusCode: 400, message: "No addresses found." });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Addresses retrieved successfully.",
            totalAddresses,
            data: addresses
        });

    } catch (err) {
        return res.status(500).json({ statusCode: 500, message: err.message });
    }
};


// Update Specific Address
exports.updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { name, mobile, street, city, state, postalCode } = req.body;

        // Checkpoint: User Blocked or Deleted
        const user = await User.findOne({ _id: req.userAuth, isDeleted: false });
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User account is deleted or blocked." });
        }

        const address = await Address.findOneAndUpdate(
            { _id: addressId, userId: req.userAuth._id, isDeleted: false },
            { name, mobile, street, city, state, postalCode },
            { new: true }
        );

        if (!address) {
            return res.status(400).json({ statusCode: 400, message: "Address not found" });
        }

        return res.status(200).json({ statusCode: 200, message: "Address updated successfully", data: address });
    } catch (err) {
        return res.status(500).json({ statusCode: 500, message: err.message });
    }
};

// Delete Specific Address
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findOne({ _id: req.userAuth, isDeleted: false });
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User account is deleted or blocked." });
        }

        const address = await Address.findOneAndUpdate(
            { _id: addressId, userId: req.userAuth._id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!address) {
            return res.status(400).json({ statusCode: 400, message: "Address not found" });
        }

        return res.status(200).json({ statusCode: 200, message: "Address deleted successfully", data: address });
    } catch (err) {
        return res.status(500).json({ statusCode: 500, message: err.message });
    }
};
