export default abstract class ArgValidatorKit{

    protected isValidSnowflake = (s: string): Boolean => /^(\d{17,19})$/ig.test(s.trim())

    protected isValidNumber = (s: string): Boolean => !isNaN(Number(s))

}
