class ZipController{
  constructor(affiliate){
    this.hasLocalStorage = this.hasLocalStorage();
    this.defaultZip = affiliate == 'kotv' ? "74120" : "73179";
    this.zips = this.get();
  }
  hasLocalStorage(){
    let uid = new Date();
      try {
          localStorage.setItem(uid, uid);
          localStorage.removeItem(uid);
          return true;
      } catch (e) {
        return false;
      }
  }

  get(){
    if(this.hasLocalStorage)
      if(localStorage.getItem('myZips'))
        return JSON.parse(localStorage.getItem('myZips'))
    return [this.defaultZip]
  }

  set(zip){
    this.zips.unshift(String(zip))
    this.zips = this.removeDuplicates(this.zips)
    if(this.hasLocalStorage)
      localStorage.setItem('myZips',JSON.stringify(this.zips))
    return this.zips;
  }

  removeDuplicates(arr){
    let unique_array = arr.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    });
    return unique_array
  }

}



export default ZipController
