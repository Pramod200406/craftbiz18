import urllib.request
import json

BASE = "http://127.0.0.1:8000"

def run_test():
    # 1. Place order
    req = urllib.request.Request(
        f"{BASE}/orders",
        data=json.dumps({"buyer_id": 1, "product_id": 1, "quantity": 2, "delivery_address": "Indiranagar, Bengaluru"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    order = json.loads(urllib.request.urlopen(req).read().decode())
    order_id = order["id"]
    print(f"Step 1: Buyer Placed Order #{order_id} -> Status: {order['status']}")

    # 2. Artisan marks ready
    req2 = urllib.request.Request(f"{BASE}/orders/{order_id}/ready", method="PUT")
    res2 = json.loads(urllib.request.urlopen(req2).read().decode())
    print(f"Step 2: Artisan Marked Order Ready -> Status: {res2['status']}")

    # 3. Courier checks available pickups and accepts order
    avail = json.loads(urllib.request.urlopen(f"{BASE}/courier/available-orders").read().decode())
    print(f"Step 3: Courier Sees {len(avail)} Available Pickups")

    req3 = urllib.request.Request(f"{BASE}/courier/1/accept/{order_id}", method="PUT")
    res3 = json.loads(urllib.request.urlopen(req3).read().decode())
    print(f"Step 4: Courier Accepted Order -> Status: {res3['status']}")

    # 4. Courier ships product
    req4 = urllib.request.Request(f"{BASE}/courier/1/ship/{order_id}", method="PUT")
    res4 = json.loads(urllib.request.urlopen(req4).read().decode())
    print(f"Step 5: Courier Ships Product -> Status: {res4['status']}")

    # 5. Courier completes delivery with Demo OTP 1234
    req5 = urllib.request.Request(
        f"{BASE}/courier/1/deliver/{order_id}",
        data=json.dumps({"otp": "1234"}).encode(),
        headers={"Content-Type": "application/json"},
        method="PUT"
    )
    res5 = json.loads(urllib.request.urlopen(req5).read().decode())
    print(f"Step 6: Courier Completed Delivery with OTP -> Status: {res5['status']}")
    print("\nSUCCESS: All 6 stages of the order lifecycle passed flawlessly!")

if __name__ == "__main__":
    run_test()
