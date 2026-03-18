# Making Repos Speakable - Gradio Interface
# This provides a web interface for the Hugging Face Space

import gradio as gr
import requests
import json
import os

# API Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")

def check_health():
    try:
        response = requests.get(f"{API_URL}/health", timeout=10)
        if response.status_code == 200:
            return "✅ Backend Connected"
        return "❌ Backend Error"
    except:
        return "❌ Cannot connect to backend"

def validate_repo(repo_url):
    try:
        response = requests.post(
            f"{API_URL}/validate-repo",
            json={"repo": repo_url},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("is_public"):
                return f"✅ Valid Public Repo: {data.get('repo')}\n📝 {data.get('description', 'No description')}"
            return f"❌ Private Repo: {data.get('message')}"
        return f"❌ Error: {response.text}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

def ingest_repo(repo_url, extensions=".md,.py,.js,.ts,.txt,.java,.cpp,.go,.rs"):
    try:
        ext_list = [e.strip() for e in extensions.split(',')]
        response = requests.post(
            f"{API_URL}/ingest",
            json={"repo": repo_url, "extensions": ext_list},
            timeout=300
        )
        if response.status_code == 200:
            data = response.json()
            return f"✅ Ingestion Complete!\n📦 {data.get('message', 'Success')}"
        return f"❌ Error: {response.text}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

def ask_question(question, top_k=5):
    try:
        response = requests.post(
            f"{API_URL}/ask",
            json={"question": question, "top_k": top_k, "threshold": 0.3},
            timeout=120
        )
        if response.status_code == 200:
            data = response.json()
            answer = data.get("answer", "No answer generated")
            sources = data.get("sources", [])
            
            result = f"## Answer\n\n{answer}\n\n"
            if sources:
                result += f"\n**Sources:** {', '.join(sources[:5])}"
            return result
        return f"❌ Error: {response.text}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

def get_status():
    try:
        response = requests.get(f"{API_URL}/ingest/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            vectors = data.get("total_vector_count", 0)
            return f"📊 Total Vectors: {vectors}"
        return "📊 No data ingested yet"
    except:
        return "📊 Status unavailable"

def clear_data():
    try:
        response = requests.post(f"{API_URL}/ingest/clear", timeout=30)
        if response.status_code == 200:
            return "🗑️ Data cleared successfully!"
        return f"❌ Error: {response.text}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

# Gradio Interface
with gr.Blocks(
    title="Making Repos Speakable",
    theme=gr.themes.Soft(
        primary_hue="indigo",
        secondary_hue="purple",
    )
) as demo:
    gr.Markdown("""
    # 🤖 Making Repos Speakable
    ### Give brain and tongue to your GitHub repositories
    """)
    
    with gr.Tab("🔗 GitHub Repository"):
        with gr.Row():
            with gr.Column():
                repo_input = gr.Textbox(
                    label="GitHub Repository URL",
                    placeholder="e.g., microsoft/vscode or https://github.com/microsoft/vscode",
                    lines=1
                )
                validate_btn = gr.Button("✓ Validate Repository", variant="primary")
                validate_output = gr.Textbox(label="Validation Result", lines=3)
                
                extensions_input = gr.Textbox(
                    label="File Extensions (comma-separated)",
                    value=".md,.py,.js,.ts,.txt,.java,.cpp,.go,.rs",
                    lines=1
                )
                ingest_btn = gr.Button("📥 Ingest Repository", variant="secondary")
                ingest_output = gr.Textbox(label="Ingestion Status", lines=3)
                
            with gr.Column():
                status_output = gr.Textbox(label="Current Status", lines=2)
                refresh_btn = gr.Button("🔄 Refresh Status")
                clear_btn = gr.Button("🗑️ Clear All Data", variant="stop")
    
    with gr.Tab("❓ Ask Questions"):
        with gr.Column():
            question_input = gr.Textbox(
                label="Your Question",
                placeholder="e.g., How do I run this project locally?",
                lines=2
            )
            top_k_slider = gr.Slider(minimum=1, maximum=10, value=5, step=1, label="Top K Results")
            ask_btn = gr.Button("💡 Ask", variant="primary", size="lg")
            answer_output = gr.Markdown(label="Answer")
    
    # Button connections
    validate_btn.click(
        fn=validate_repo,
        inputs=repo_input,
        outputs=validate_output
    )
    
    ingest_btn.click(
        fn=ingest_repo,
        inputs=[repo_input, extensions_input],
        outputs=ingest_output
    )
    
    refresh_btn.click(
        fn=get_status,
        inputs=[],
        outputs=status_output
    )
    
    clear_btn.click(
        fn=clear_data,
        inputs=[],
        outputs=status_output
    )
    
    ask_btn.click(
        fn=ask_question,
        inputs=[question_input, top_k_slider],
        outputs=answer_output
    )

# For local testing
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
