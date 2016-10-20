const fs = require('fs');
const async = require('async');

const removeFolder = (location, callback)=>{
  const exists = fs.existsSync(location);
  const stats = exists && fs.statSync(location);
  const isDirectory = exists && stats.isDirectory();
  if(!isDirectory){
    return callback();
  }
  fs.readdir(location, (err, files)=>{
    async.each(files, (file, next)=>{
      file = location + '/' + file;
      fs.stat(file, (err, stat)=>{
        if (err){
          return next(err);
        }
        if (stat.isDirectory()){
          return removeFolder(file, next);
        }
        fs.unlink(file, (err)=>{
          if (err) {
            return next(err);
          }
          return next();
        });
      });
    }, (err)=>{
      if (err){
        return callback(err);
      }
      fs.rmdir(location, (err)=>{
        return callback(err);
      });
    });
  });
};

module.exports = {
  removeFolder
};
