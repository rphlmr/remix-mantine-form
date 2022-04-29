import {
  Box,
  Button,
  Center,
  Group,
  NumberInput,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, { message: "Name should have at least 2 letters" }),
  email: z.string().email({ message: "Invalid email" }),
  age: z
    .number()
    .min(18, { message: "You must be at least 18 to create an account" }),
});

// #region Action
interface ActionResultData {
  success?: boolean;
  errors?: Record<string, string>;
}

export const action: ActionFunction = async ({ request }) => {
  const formValidation = await getFormData(request, schema);

  if (!formValidation.success) {
    return json<ActionResultData>(
      {
        errors: formValidation.errors,
      },
      { status: 400 }
    );
  }

  const { name, email, age } = formValidation.data;

  console.log(
    `server side log : name = ${name}, email = ${email}, age = ${age}`
  );

  return json<ActionResultData>({ success: true });
};
// #endregion

export default function Index() {
  const submit = useSubmit();
  const actionResult = useActionData() as ActionResultData;

  console.log("client side log", actionResult);

  const form = useForm({
    schema: zodResolver(schema),
    initialValues: {
      name: "",
      email: "",
      age: 18,
    },
  });

  useEffect(() => {
    if (actionResult?.errors) {
      form.setErrors(actionResult?.errors);
      actionResult.errors = undefined;
    }

    if (actionResult?.success) {
      form.reset();
      actionResult.success = undefined;
    }
  }, [actionResult, form]);

  return (
    <Center sx={{ width: "100vw", height: "100vh" }}>
      <Box sx={{ maxWidth: 300 }} mx="auto">
        <form
          onSubmit={form.onSubmit((values) => {
            const formData = new FormData();

            for (const [key, value] of Object.entries(values)) {
              formData.append(key, value as string);
            }

            submit(formData, { replace: true, method: "post" });
          })}
        >
          <TextInput
            required
            label="Email"
            placeholder="example@mail.com"
            onBlur={() => form.validateField("email")}
            {...form.getInputProps("email")}
          />
          <TextInput
            required
            label="Name"
            placeholder="John Doe"
            mt="sm"
            onBlur={() => form.validateField("name")}
            {...form.getInputProps("name")}
          />
          <NumberInput
            required
            label="Age"
            placeholder="Your age"
            mt="sm"
            onBlur={() => form.validateField("age")}
            {...form.getInputProps("age")}
          />

          <Group position="right" mt="xl">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Box>
    </Center>
  );
}
