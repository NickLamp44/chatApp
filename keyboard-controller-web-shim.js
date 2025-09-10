const KeyboardController = {
  setInputMode: () => {},
  setDefaultMode: () => {},
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
};

const KeyboardProvider = ({ children }) => children;

const useKeyboardController = () => ({
  enabled: false,
  height: 0,
  progress: { value: 0 },
});

const useReanimatedKeyboardAnimation = () => ({
  height: { value: 0 },
  progress: { value: 0 },
});

module.exports = {
  KeyboardController,
  KeyboardProvider,
  useKeyboardController,
  useReanimatedKeyboardAnimation,
  default: KeyboardController,
};
