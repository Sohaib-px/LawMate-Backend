exports.createAppointment = async (req, res) => {
  try {
    const { lawyerId, date, time, reason, clientId } = req.body;
    
    // Fail-safe: Agar headers se user id na mile toh body se fallback uthaye
    const finalClientId = req.user?.id || clientId;

    if (!finalClientId) {
      return res.status(400).json({ msg: 'Client ID is required' });
    }
    
    // Trim string types to avoid 25-character length overflow errors
    const cleanedLawyerId = lawyerId.trim();
    const cleanedClientId = finalClientId.trim();

    const newAppointment = new Appointment({
      clientId: cleanedClientId,
      lawyerId: cleanedLawyerId,
      date,
      time,
      reason
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};