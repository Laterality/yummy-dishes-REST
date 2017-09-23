
export function isObjectid(s: string): boolean {
	const regexOID = new RegExp("^[a-fA-F0-9]{24}$");
	return regexOID.test(s);
}

export function isValidEmail(s: string): boolean {
	const regexEmail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
	return regexEmail.test(s);
}

/**
 * pending -> processing -> (receiving ->) received
 *        `-> rejected
 */
export function isValidStateChanging(sCurrent: string, sChange: string): boolean {
	if (sCurrent === "pending" &&
	(sChange === "rejected" ||
	sChange === "processing" ||
	sChange === "cancelled")) {
		return true;
	}
	else if (sCurrent === "processing" &&
			sChange === "receiving" || sChange === "received") {
		return true;
	}
	else if (sCurrent === "receiving" && sChange === "received") {
		return true;
	}
	return false;
}
