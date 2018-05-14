(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(true);
    } else {
        var Pluralizer = factory();
        var pluralizer = new Pluralizer();
        window.pluralizer = pluralizer;
    }
}(this, function(){

    var Pluralizer = function(){
        this.rules = null;
        this.__cached = {};
    };

    Pluralizer.prototype = {
        expressions : {
            range : function(input, from, to){
                console.log(this);
                var expName = ["range", from, to].join("@");
                if (this.__cahced && this.__cahced[expName]){
                    return this.__cahced[expName];
                }

                var regexp = "";
                for (var a = from; a <= to; a++){
                    regexp += [a.toString(), "|"].join("");
                }

                regexp = regexp.substring(0, regexp.length - 1);
                regexp = ["(", regexp, ")"].join("");

                this.__cahced[expName] = regexp;

                return regexp;
            },
            ends : function(input, value){
                console.log(value);
                return input.toString().match(new RegExp([value, "$"].join(""))) != null;
            },
            equals : function(input, value){
                return input == value;
            },  
            any : function(input){
                return true;
            }
        },
        tools : {
            loop : function(list, cb, ctx){
                if (typeof list == "object" && typeof list.length == "number"){
                    for (var a = 0, l = list.length; a < l; a++){
                        cb.call(ctx, list[a], a, list);
                    }
                } else if (typeof list == "object"){
                    for (var a in list){
                        cb.call(ctx, list[a], a, list);
                    }
                }
            }
        },
        setRules : function(rulesString){
            this.rules = this.__parseRules(rulesString);
        },
        make : function(){

        },
        __parseRules : function(rulesString){
            var splitted = rulesString.split("#");
            var rules = [];
            var e = this.expressions;

            this.tools.loop(splitted, function(token, a){
                token = token.replace(/[?(]/g, "(v,");
                rules[a] = (function(
                    range,
                    ends,
                    equals,
                    any
                ){
                    var ruleCheckerCode = ["var f = function(v){return ", token, ";};f;"].join("");
                    return eval(ruleCheckerCode);
                })(
                    e.range.bind(this),
                    e.ends.bind(this),
                    e.equals.bind(this),
                    e.any.bind(this)
                );
            }, this);

            return rules;
        },
    };

    return Pluralizer;
    
}));