
export function isObjectid(s: string): boolean {
	const regexOID = new RegExp("^[a-fA-F0-9]{24}$");
	return regexOID.test(s);
}
