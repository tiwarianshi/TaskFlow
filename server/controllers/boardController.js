const boardTest = (req, res) => {
  res.status(200).json({ message: 'boards route working' })
}

module.exports = { boardTest }
