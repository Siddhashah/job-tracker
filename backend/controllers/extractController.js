exports.extractPosting = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    console.log('Using ML_SERVICE_URL:', mlServiceUrl);

    const response = await fetch(`${mlServiceUrl}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`ML service responded with ${response.status}`);

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Extraction failed: ' + err.message });
  }
};