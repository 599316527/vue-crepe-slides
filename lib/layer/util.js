
export function calculateExpression(expression, params) {
  let runtimeExpression = Object.keys(params)
    .reduce(function (expression, key) {
      // TODO: validate expression
      return expression.replace(
        new RegExp(key + '\\b|' + key + '$', 'g'),
        params[key]
      )
    }, expression)

  try {
    // console.log('return ' + runtimeExpression)
    return (new Function('return ' + runtimeExpression))()
  }
  catch (err) {
    console.warn('Fail to parse the expression: ' + val)
    return null
  }
}
