import * as bcrypt from "bcrypt-nodejs";

// tuple with hashed password and salt
export type auth = [string, string];

export async function encryption(raw: string, salt = bcrypt.genSaltSync(10)): Promise<auth> {
	const pwHashed = bcrypt.hashSync(raw, salt);
	return [pwHashed, salt];
}
