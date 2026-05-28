const taskTest = (req, res) => {
  res.status(200).json({ message: 'tasks route working' })
}

module.exports = { taskTest }
