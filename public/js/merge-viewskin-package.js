
function MvcmergeViewSkinPackage(){
	
	this.name = '' ;
	this.css = {} ;
	this._res = {} ;
	
	this.addResource = function(filename,content){
		this._res[filename] = {
			content: content
			, length: strlen(content)
		}
	}
	
	this.pack = function(){
		return $.base64Encode($.toJSON(this)) ;
	}
	
	
}

MvcmergeViewSkinPackage.unpack = function(string){
	return $.evalJSON($.base64Decode(string)) ;
}
