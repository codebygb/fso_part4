const info = (...args) => {
  if (process.env.NODE_ENV === "test") return;
  console.log(...args);
};

const error = (...args) => {
  if (process.env.NODE_ENV === "test") return;
  console.error(...args);
};

module.exports = { info, error };
