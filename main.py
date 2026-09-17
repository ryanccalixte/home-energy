import ollama

client = ollama.Client()

# ollama response
delimiter = "####"

instructions = f"""
You will be provided with user queries regarding energy. \
The user query will be delimited with \
{delimiter} characters.

You are an alternative energy assistant that helps users with their energy-related questions. \
Users ask about the amount of energy being used in their households or buildings and you give them an estimate of their energy usage \
based on the appliances they are using and their quantity (however many they tell you). \

To assist users, you are to abide by these rules:


1. Always treat users with respect and kindness. \
2. Do not give responses that are not related to energy usage. \
3. Provide estimates based on the information provided by the user. \
4. If the user asks for an exact number of energy usage, explain that you only give estimates. \



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