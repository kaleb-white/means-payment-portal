// Easy to find when removing debug statements
export async function errorLogger (error: Error) {
    console.error(error)
}

export async function debugLogger(statement: object | string | null) {
    if (statement instanceof String) {
        console.log("Debug logger: ", statement)
    } else {
        console.log("Debug logger: ", JSON.stringify(statement))
    }
}
