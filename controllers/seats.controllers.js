const Seat = require("../models/seat.model");

exports.getAll = async (req, res) => {
    try {
        res.json(await Seat.find());
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

exports.getById = async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat) res.status(404).json({ message: "Not found" });
        else res.json(seat);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

exports.addNew = async (req, res) => {
    try {
        const { day, seat, client, email } = req.body;
        const newSeat = new Seat({
            day: day,
            seat: seat,
            client: client,
            email: email,
        });
        if (await Seat.exists({ day: day, seat: seat })) {
            res.status(409).json({ message: "The slot is already taken" });
        } else {
            await newSeat.save();
            const seats = await Seat.find();
            req.io.emit('seatsUpdated', seats);
        }
        res.json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

exports.change = async (req, res) => {
    const { day, seat, client, email } = req.body;
    try {
        await Seat.findByIdAndUpdate(
            req.params.id,
            { $set: { day: day, seat: seat, client: client, emial: email } },
            { new: true },
            (err, doc) => {
                if (err) res.status(404).json({ message: "Not found..." });
                else res.json(doc);
            }
        );
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

exports.delete = async (req, res) => {
    try {
        await Seat.findByIdAndRemove(req.params.id, (err, doc) => {
            if (err) res.status(404).json({ message: "Not found..." });
            else res.json(doc);
        });
    } catch (err) {
        res.status(500).json({ message: err });
    }
    req.io.emit("seatsUpdated", db.seats);
};