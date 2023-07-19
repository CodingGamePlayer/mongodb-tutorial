const addSum = (a, b, cb) => {
   setTimeout(() => {
      if (typeof a !== "number" || typeof b !== "number") {
         return cb("a,b must be numbers");
      }

      cb(undefined, a + b);
   }, 3000);
};

let cb = (err, sum) => {
   if (err) {
      return console.log({ err });
   }
   console.log({ sum });
};

addSum(10, "asd", cb);
