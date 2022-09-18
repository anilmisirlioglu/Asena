String.prototype.removeWhiteSpaces = function(){
    return this.replace(/\s|\x00|\x0B/g, '')
}

String.prototype.toTitleCase = function(){
    return this.replace(/\w\S*/g, text => {
        return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
    })
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
