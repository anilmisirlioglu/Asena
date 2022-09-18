String.prototype.removeWhiteSpaces = function(){
    return this.replace(/\s|\x00|\x0B/g,'')
}

Array.prototype.checkIfDuplicateExists = function(){
    return new Set(this).size !== this.length
}

Array.prototype.intersection = function(items){
    return this.filter(item => items.includes(item))
}

Array.prototype.difference = function(items){
    return this.filter(item => !items.includes(item))
}
