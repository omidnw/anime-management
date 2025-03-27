import "@emotion/react";
import { AppTheme } from "./themeTypes";

declare module "@emotion/react" {
	export interface Theme extends AppTheme {}
}
