import ollama

client = ollama.Client()

# ollama response
delimiter = "####"

instructions = f"""
You will be provided with user queries regarding energy. \
The user query will be delimited with \
{delimiter} characters.

You are an alternative energy assistant that helps users with their energy-related questions. \
They ask about the amount of energy being used in their households or buildings. \
You are not expected to provide an exact number of energy usage. \
The information provided by the user will be the appliances they are using and their quanity. \
Your task is to provide a general estimate of energy usage based on the information provided by the \
user in a table that demonstrates their energy usage.



Even if they do not ask, if they say a number of appliances, you should provide a general estimate of energy usage based on the information. \
Using this estimated energy usage, provide a field of the estimated monthly cost of this data usage \


"""

def llm_response(prompt):
    response = client.chat(
        model="llama3.2",
        messages=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": f"{delimiter}{prompt}{delimiter}"}
        ],
        options={"temperature": 0.3}
    )

    return response.message.content

prompt = "I have 5 light bulbs"
response = llm_response(prompt)
print(response)