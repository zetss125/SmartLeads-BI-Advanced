import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# Vocabulary definition matching the backend tokenizer
VOCAB = [
    "<pad>", "<unk>",
    "added", "to", "cart", "remove", "removed",
    "viewed", "details", "product", "page", "site", "website",
    "sizing", "inquiries", "inquiry", "size", "fit",
    "restock", "requests", "request", "notification",
    "wishlist", "saves", "save", "saved",
    "urgency", "markers", "marker", "high", "medium", "low",
    "facebook", "instagram", "tiktok", "twitter", "x", "linkedin",
    "clicked", "link", "sent", "message", "commented", "comment",
    "purchase", "checkout", "buy"
]

vocab_map = {word: idx for idx, word in enumerate(VOCAB)}
VOCAB_SIZE = len(VOCAB)
SEQ_LEN = 32

def tokenize(text):
    tokens = text.lower().replace(";", " ").replace(",", " ").split()
    ids = []
    for token in tokens:
        if token in vocab_map:
            ids.append(vocab_map[token])
        else:
            ids.append(vocab_map["<unk>"])
    # Pad or truncate
    if len(ids) < SEQ_LEN:
        ids += [vocab_map["<pad>"]] * (SEQ_LEN - len(ids))
    else:
        ids = ids[:SEQ_LEN]
    return ids

# Define training dataset
TRAINING_DATA = [
    ("added to cart viewed details high urgency", 95.0),
    ("added to cart restock requests high urgency", 98.0),
    ("added to cart", 75.0),
    ("restock requests added to cart", 85.0),
    ("sizing inquiries wishlist saves high urgency", 78.0),
    ("sizing inquiries wishlist saves", 60.0),
    ("wishlist saves high urgency", 68.0),
    ("viewed details product page", 20.0),
    ("removed from cart", 10.0),
    ("sizing inquiries low urgency", 35.0),
    ("high urgency restock requests", 80.0),
    ("viewed details site facebook", 15.0),
    ("clicked link instagram message", 30.0),
    ("sent message commented on post", 25.0),
    ("sizing inquiries size fit", 50.0),
    ("restock request size fit", 65.0),
    ("checkout purchase buy", 99.0),
    ("remove from cart viewed details", 12.0),
    ("instagram sizing inquiry message", 45.0),
    ("tiktok clicked link product page", 22.0),
    ("facebook comment inquiry", 35.0),
    ("linkedin clicked link message", 28.0),
    ("high urgency wishlist saves restock", 88.0),
    ("medium urgency viewed details", 40.0),
    ("low urgency clicked link", 18.0)
]

# Duplicate training data to make it larger
X_train = []
y_train = []
for text, score in TRAINING_DATA * 10:
    X_train.append(tokenize(text))
    y_train.append([score])

X_train = torch.tensor(X_train, dtype=torch.long)
y_train = torch.tensor(y_train, dtype=torch.float32)

class LeadScorerTransformer(nn.Module):
    def __init__(self, vocab_size, embed_dim=64, num_heads=4, ff_dim=128, seq_len=32):
        super(LeadScorerTransformer, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.pos_embedding = nn.Parameter(torch.randn(1, seq_len, embed_dim))
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim, 
            nhead=num_heads, 
            dim_feedforward=ff_dim, 
            batch_first=True,
            activation="relu"
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=2)
        self.fc = nn.Sequential(
            nn.Linear(embed_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )
        
    def forward(self, x):
        # x shape: [batch_size, seq_len]
        x_emb = self.embedding(x) + self.pos_embedding
        x_trans = self.transformer(x_emb)
        # Average pooling across sequence dimension
        x_pooled = torch.mean(x_trans, dim=1)
        # Final prediction (0 to 100)
        out = self.fc(x_pooled) * 100.0
        return out

def train_model():
    model = LeadScorerTransformer(VOCAB_SIZE, seq_len=SEQ_LEN)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005)
    
    epochs = 40
    batch_size = 32
    dataset_size = X_train.size(0)
    
    print("Training model...")
    for epoch in range(epochs):
        permutation = torch.randperm(dataset_size)
        epoch_loss = 0
        for i in range(0, dataset_size, batch_size):
            indices = permutation[i:i+batch_size]
            batch_x, batch_y = X_train[indices], y_train[indices]
            
            optimizer.zero_grad()
            predictions = model(batch_x)
            loss = criterion(predictions, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * len(indices)
            
        epoch_loss /= dataset_size
        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs} - Loss: {epoch_loss:.4f}")
            
    # Test on a few samples
    model.eval()
    with torch.no_grad():
        test_samples = [
            "added to cart viewed details high urgency",
            "viewed details product page",
            "sizing inquiries wishlist saves"
        ]
        for sample in test_samples:
            tokenized = torch.tensor([tokenize(sample)], dtype=torch.long)
            pred = model(tokenized).item()
            print(f"Sample: '{sample}' -> Predicted Score: {pred:.2f}")
            
    return model

def export_onnx(model, save_path):
    model.eval()
    dummy_input = torch.zeros((1, SEQ_LEN), dtype=torch.long)
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    # Export the model
    torch.onnx.export(
        model,
        dummy_input,
        save_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input_ids'],
        output_names=['score'],
        dynamic_axes={'input_ids': {0: 'batch_size'}, 'score': {0: 'batch_size'}}
    )
    print(f"Model successfully exported to {save_path}")

if __name__ == "__main__":
    trained_model = train_model()
    # Save to backend folder
    export_onnx(trained_model, "backend/assets/model.onnx")
