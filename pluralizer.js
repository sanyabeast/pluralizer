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

    var _pluralizer;

    var Pluralizer = function(newInstance){
        if (newInstance !== true && _pluralizer instanceof Pluralizer){
            return _pluralizer;
        }

        _pluralizer = this;

        this.rules = null;
        this.__cached = {};
    };

    Pluralizer.prototype = {
        expressions : {
            range : function(input, from, to){
                var expName = ["range", from, to].join("@");
                /*if (this.__cahced && this.__cahced[expName]){
                    return this.__cahced[expName];
                }*/

                var regexp = "";
                for (var a = from; a <= to; a++){
                    regexp += [a.toString(), "|"].join("");
                }

                regexp = regexp.substring(0, regexp.length - 1);
                regexp = ["(", regexp, ")"].join("");

                /*this.__cahced[expName] = regexp;*/

                return regexp;
            },
            or : function(){
                var args = Array.prototype.slice.call(arguments, 1, arguments.length);
                return ["(", args.join("|"), ")"].join("");
            },
            and : function(){
                return Array.prototype.indexOf.call(arguments, false) < 0;
            },
            some : function(){
                return ["(", Array.prototype.join.call(arguments, "|"), ")"].join("");
            },
            ends : function(input, value){
                return [value, "$"].join("");
                // return input.toString().match(new RegExp([value, "$"].join(""))) != null;
            },
            equals : function(input, value){
                return ["(", "^", value, "$)"].join("");
            },  
            any : function(input){
                return ["(", ".+", ")"].join("");
            }
        },
        tools : {
            loop : function(list, cb, ctx){
                if (typeof list == "object" && list !== null && typeof list.length == "number"){
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
        make : function(inputString, vars){
            return this.__parseString(inputString, vars);
        },
        __parseString : function(inputString, vars){
            var result = inputString;
            var tokens = inputString.match(/\#{[^${]*}/g);
            
            this.tools.loop(tokens, function(token, index){
                var cleanToken = token.substring(2, token.length - 1);
                var varName = cleanToken.split("?")[1];
                var forms = cleanToken.split("?")[0].split("@");


                if (forms.length && typeof vars[varName] !== "undefined"){
                    result = result.replace(token, forms[this.__getMatchedRule(vars[varName])] || "");
                } else if (forms.length){
                    result = result.replace(token, forms[0]);
                } else {
                    result = result.replace(token, "");
                }

            }, this);

            return result;

        },
        __getMatchedRule : function(value){
            var result = 0;

            this.tools.loop(this.rules, function(checker, index){
                if (checker(value)){
                    result = index;
                }
            });

            return result;
        },
        __parseRules : function(rulesString){
            var splitted = rulesString.split("#");
            var rules = [];
            var e = this.expressions;
            var _this = this;

            this.tools.loop(splitted, function(token, a){
                token = token.replace(/[?(]/g, "(v,");
                rules[a] = (function(
                    range,
                    or,
                    and,
                    some,
                    ends,
                    equals,
                    any
                ){
                    var ruleCheckerCode = ["var f = function(v){return _this.__check(v, ", token, ");};f;"].join("");
                    return eval(ruleCheckerCode);
                })(
                    e.range.bind(this),
                    e.or.bind(this),
                    e.and.bind(this),
                    e.some.bind(this),
                    e.ends.bind(this),
                    e.equals.bind(this),
                    e.any.bind(this)
                );
            }, this);

            return rules;
        },
        __check : function(input, regexp){
            return input.toString().match(new RegExp(regexp)) !== null;
        }
    };

    return Pluralizer;
    
}));