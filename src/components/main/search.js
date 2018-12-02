class Search {
  /**
   input:
   data: data array
   dataMap: key value pair QueryID -> dataObject
   limit: options maximum count: e.g. 10 for show top 10 options
   target: a string for matching
  */
  constructor(data, dataMap, limit) {
    this.data = data.map(item => ({
      id: item.QueryID,
      name: item.ResponseName.toUpperCase()
    }));
    this.dataMap = dataMap;
    this.limit = limit;
    this.exec = this.exec.bind(this);
  }

  //return top limit results as [...QueryIDs]
  exec(target) {
    let count = 0;
    let ret = [];
    for (let i in this.data) {
      if (count >= this.limit) break;
      if (this.data[i].name.includes(target.toUpperCase())) {
        ret.push(this.data[i].id);
        count++;
      }
    }
    return ret;
  }
}

export default Search;
