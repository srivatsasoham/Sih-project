import re
import app

def compile_pages():
    with app.app.test_request_context():
        pages = {
            'index.html': app.index(),
            'worker.html': app.worker_dashboard(),
            'governance.html': app.governance(),
            'community.html': app.community(),
            'about.html': app.about()
        }

        for filename, content in pages.items():
            # Adjust static and route links so pages can load seamlessly directly or via static web server
            html = content
            html = html.replace('/static/css/style.css', 'static/css/style.css')
            html = html.replace('/static/js/coop-live-sync.js', 'static/js/coop-live-sync.js')
            html = html.replace('/static/js/main.js', 'static/js/main.js')
            html = html.replace('/static/js/booking.js', 'static/js/booking.js')
            html = html.replace('/static/js/worker.js', 'static/js/worker.js')
            html = html.replace('/static/js/resilience.js', 'static/js/resilience.js')
            
            # Nav links
            html = re.sub(r'href="/"', 'href="index.html"', html)
            html = re.sub(r'href="/worker"', 'href="worker.html"', html)
            html = re.sub(r'href="/governance"', 'href="governance.html"', html)
            html = re.sub(r'href="/community"', 'href="community.html"', html)
            html = re.sub(r'href="/about"', 'href="about.html"', html)

            with open(filename, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"Generated {filename}")

if __name__ == '__main__':
    compile_pages()
