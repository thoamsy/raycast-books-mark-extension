import type { LaunchProps } from "@raycast/api";
import { BookSearchForm } from "./components/BookSearchForm";

export default function Command(props: LaunchProps<{ arguments: Arguments.AddNewBook }>) {
  return <BookSearchForm initialTitle={props.arguments.title} />;
}
