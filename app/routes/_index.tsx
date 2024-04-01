import { redirect } from "@remix-run/server-runtime";

export const loader = () => {
	throw redirect("/me");
};

export default function Index() {
	return null;
}
