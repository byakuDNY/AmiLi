<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Tags/index', [
            'tags' => Tag::where('user_id', Auth::id())->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tags' => 'required|array',
            'tags.*' => 'required|string|max:30|unique:tags,name'
        ], [
            'tags.*.required' => 'Tag name is required',
            'tags.*.max' => 'Tag name cannot be longer than 30 characters',
            'tags.*.unique' => 'Tag ":input" already exists'
        ]);

        collect($validated['tags'])->each(function ($tagName) {
            Tag::create(['name' => trim($tagName), 'user_id' => Auth::id()]);
        });

        return redirect()->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tag $tag)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();
        return redirect()->back();
    }
}
